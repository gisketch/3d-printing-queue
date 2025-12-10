# PocketBase Setup Guide

This document explains how to set up PocketBase for the Netzon 3D Print Queue system.

## 1. Download and Run PocketBase

```bash
# Download PocketBase from https://pocketbase.io/docs/
# Extract and run:
./pocketbase serve
```

Access the admin UI at `http://127.0.0.1:8090/_/`

## 2. Create Collections

### Collection: `users` (Extend System Collection)

Go to Settings > Auth Collection > users and add these fields:

| Field Name | Type | Options |
|------------|------|---------|
| `name` | Text | Required |
| `role` | Select | Values: `user`, `admin`. Default: `user` |
| `total_print_time` | Number | Default: 0 (stores hours) |
| `must_change_password` | Boolean | Default: false |

### Collection: `jobs`

Create a new collection called `jobs` with these fields:

| Field Name | Type | Options |
|------------|------|---------|
| `project_name` | Text | Required, Max: 200 |
| `stl_file` | File | Max size: 50MB, Types: .stl, .gcode |
| `stl_link` | URL | - |
| `status` | Select | Values: `pending_review`, `queued`, `printing`, `completed`, `rejected`, `failed`. Required |
| `admin_notes` | Text | Max: 1000 |
| `price_pesos` | Number | Min: 0 |
| `estimated_duration_min` | Number | Min: 0 |
| `actual_duration_min` | Number | Min: 0 |
| `priority_score` | Number | Default: 0 |
| `user` | Relation | Collection: users, Required |

### Collection: `user_requests`

Create a new collection called `user_requests` with these fields:

| Field Name | Type | Options |
|------------|------|---------|
| `full_name` | Text | Required, Max: 100 |
| `desired_username` | Text | Required, Max: 50 |
| `status` | Select | Values: `pending`, `approved`, `rejected`. Default: `pending` |
| `notes` | Text | Max: 500 |

## 3. API Rules

### `jobs` Collection Rules

- **List/View**: `` (empty = public - everyone can see the queue)
- **Create**: `@request.auth.id != ""`
- **Update**: `@request.auth.role = "admin"`
- **Delete**: `@request.auth.role = "admin"`

### `user_requests` Collection Rules

- **List/View**: `@request.auth.role = "admin"`
- **Create**: `` (empty = anyone can request)
- **Update**: `@request.auth.role = "admin"`
- **Delete**: `@request.auth.role = "admin"`

### `users` Collection Rules

- **List/View**: `@request.auth.id != ""` (logged in users can see other users)
- **Create**: `@request.auth.role = "admin"` (only admins create users)
- **Update**: `id = @request.auth.id || @request.auth.role = "admin"` (self or admin)
- **Delete**: `@request.auth.role = "admin"`

## 4. Install Hooks

Copy the `pb_hooks/calculate_priority.pb.js` file to your PocketBase `pb_hooks` directory.

Restart PocketBase to load the hooks:
```bash
./pocketbase serve
```

## 5. Create Admin Accounts

Create 3 seeded admin accounts via PocketBase Admin UI:

1. Go to Collections > users > New Record
2. Create accounts with:
   - Username: `admin1`, `admin2`, `admin3`
   - Role: `admin`
   - Name: Admin names
   - Password: Strong passwords
   - `must_change_password`: false (for admins)

## 6. Environment Configuration

Update your `.env` file:

```env
VITE_POCKETBASE_URL=http://localhost:8090
```

For production:
```env
VITE_POCKETBASE_URL=https://your-domain.com
```

## 7. Deploy PocketBase

### Using Docker

```dockerfile
FROM alpine:latest

ARG PB_VERSION=0.22.0

RUN apk add --no-cache \
    unzip \
    ca-certificates

ADD https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip /tmp/pb.zip
RUN unzip /tmp/pb.zip -d /pb/

EXPOSE 8090

CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8090"]
```

### Using Systemd

```ini
[Unit]
Description=PocketBase
After=network.target

[Service]
Type=simple
User=pocketbase
ExecStart=/path/to/pocketbase serve --http="0.0.0.0:8090"
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

## 8. Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8090;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Troubleshooting

### Realtime not working
- Ensure WebSocket connections are allowed through your proxy
- Check that `proxy_set_header Upgrade` and `Connection` headers are set

### File uploads failing
- Check file size limits in Nginx: `client_max_body_size 50M;`
- Verify PocketBase has write permissions to `pb_data` directory

### Priority not calculating
- Ensure the `pb_hooks` directory is in the same folder as the PocketBase binary
- Restart PocketBase after adding/modifying hooks
- Check PocketBase logs for errors
