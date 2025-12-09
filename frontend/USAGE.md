# Using gisketch-neumorphism in Your Project

A neumorphic component library for React, featuring soft UI design with light/dark mode support.

## Installation

### Option 1: Install from npm (after publishing)

```bash
npm install gisketch-neumorphism
```

### Option 2: Install from local path (development)

```bash
npm install /path/to/gisketch-neumorphism
# or with relative path
npm install ../gisketch-neumorphism
```

### Option 3: Link locally (for development)

```bash
# In the gisketch-neumorphism directory
npm link

# In your project directory
npm link gisketch-neumorphism
```

---

## Setup

### 1. Install Peer Dependencies

Make sure you have the required peer dependencies:

```bash
npm install react react-dom tailwindcss
```

### 2. Import the Styles

Import the component library styles in your app's entry point (e.g., `main.tsx`, `App.tsx`, or `layout.tsx`):

```tsx
// Option A: Import everything
import "gisketch-neumorphism/styles";

// Option B: Import in your CSS file
// @import "gisketch-neumorphism/dist/styles.css";
```

### 3. Configure Tailwind (if using Tailwind in your project)

Add the library's content path to your `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    // Add this line to include gisketch-neumorphism components
    "./node_modules/gisketch-neumorphism/dist/**/*.{js,mjs,cjs}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

### 4. Enable Dark Mode

The library supports dark mode via the `dark` class on the `<html>` element:

```html
<!-- Light mode (default) -->
<html>
  ...
</html>

<!-- Dark mode -->
<html class="dark">
  ...
</html>
```

You can toggle dark mode programmatically:

```tsx
// Toggle dark mode
document.documentElement.classList.toggle("dark");

// Set dark mode
document.documentElement.classList.add("dark");

// Set light mode
document.documentElement.classList.remove("dark");
```

---

## Usage Examples

### Button

```tsx
import { Button } from "gisketch-neumorphism";

function App() {
  return (
    <div className="space-x-4">
      {/* Default neumorphic button */}
      <Button>Click me</Button>

      {/* Colored variants */}
      <Button variant="primary">Primary</Button>
      <Button variant="success">Success</Button>
      <Button variant="warning">Warning</Button>
      <Button variant="destructive">Delete</Button>

      {/* Sizes */}
      <Button size="sm">Small</Button>
      <Button size="lg">Large</Button>
      <Button size="xl">Extra Large</Button>

      {/* States */}
      <Button variant="pressed">Pressed</Button>
      <Button variant="flat">Flat</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="outline">Outline</Button>

      {/* Icon button */}
      <Button size="icon">🔔</Button>

      {/* Disabled */}
      <Button disabled>Disabled</Button>
    </div>
  );
}
```

### Card

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
} from "gisketch-neumorphism";

function App() {
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Your card content here.</p>
      </CardContent>
      <CardFooter>
        <Button>Action</Button>
      </CardFooter>
    </Card>
  );
}
```

### File Upload

```tsx
import { FileUpload, FilePreview } from "gisketch-neumorphism";
import { useState } from "react";

function App() {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <div className="space-y-4">
      <FileUpload
        onFilesSelected={(newFiles) => setFiles([...files, ...newFiles])}
        title="Drop files here or click to upload"
        description="PNG, JPG, PDF up to 10MB"
        multiple
        maxSize={10 * 1024 * 1024}
      />

      {files.map((file, index) => (
        <FilePreview
          key={index}
          file={file}
          onRemove={() => setFiles(files.filter((_, i) => i !== index))}
        />
      ))}
    </div>
  );
}
```

### Input & Form Fields

```tsx
import { Input, Label, FormField, Textarea } from "gisketch-neumorphism";

function App() {
  return (
    <form className="space-y-4">
      {/* Simple input with label */}
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="you@example.com" />
      </div>

      {/* Using FormField wrapper */}
      <FormField
        label="Username"
        description="This will be your public display name."
      >
        <Input placeholder="johndoe" />
      </FormField>

      {/* With error state */}
      <FormField label="Password" error="Password must be at least 8 characters">
        <Input type="password" />
      </FormField>

      {/* Textarea */}
      <FormField label="Bio">
        <Textarea placeholder="Tell us about yourself..." />
      </FormField>
    </form>
  );
}
```

### Select (Dropdown)

```tsx
import { Select, SelectTrigger, SelectContent, SelectItem } from "gisketch-neumorphism";
import { useState } from "react";

function App() {
  const [value, setValue] = useState("");

  return (
    <Select value={value} onValueChange={setValue}>
      <SelectTrigger placeholder="Select a fruit" />
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="orange">Orange</SelectItem>
      </SelectContent>
    </Select>
  );
}
```

### Radio Group

```tsx
import { RadioGroup, RadioGroupItem, Label } from "gisketch-neumorphism";
import { useState } from "react";

function App() {
  const [plan, setPlan] = useState("free");

  return (
    <RadioGroup value={plan} onValueChange={setPlan}>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="free" id="free" />
        <Label htmlFor="free">Free</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="pro" id="pro" />
        <Label htmlFor="pro">Pro</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="enterprise" id="enterprise" />
        <Label htmlFor="enterprise">Enterprise</Label>
      </div>
    </RadioGroup>
  );
}
```

### Sidebar

```tsx
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarItem,
} from "gisketch-neumorphism";

function App() {
  return (
    <div className="flex h-screen">
      <Sidebar>
        <SidebarHeader>
          <h2 className="text-xl font-bold">My App</h2>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarItem active>Dashboard</SidebarItem>
            <SidebarItem>Analytics</SidebarItem>
            <SidebarItem>Reports</SidebarItem>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Settings</SidebarGroupLabel>
            <SidebarItem>Profile</SidebarItem>
            <SidebarItem>Preferences</SidebarItem>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarItem>Logout</SidebarItem>
        </SidebarFooter>
      </Sidebar>

      <main className="flex-1 p-6">
        {/* Your page content */}
      </main>
    </div>
  );
}
```

### Table

```tsx
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "gisketch-neumorphism";

function App() {
  const users = [
    { id: 1, name: "John Doe", email: "john@example.com", role: "Admin" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "User" },
  ];

  return (
    <Table>
      <TableCaption>A list of your team members.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.role}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

---

## Full Component List

| Category     | Components                                                                    |
| ------------ | ----------------------------------------------------------------------------- |
| **Core**     | Button, Card, Input, Textarea                                                 |
| **Form**     | Label, FormField, Select, RadioGroup, Checkbox, Switch, FileUpload            |
| **Data**     | Table, Badge, Avatar, Progress, Slider                                        |
| **Layout**   | Sidebar, Separator                                                            |
| **Typography** | Heading, Text, Code, Blockquote, List                                       |
| **Feedback** | Skeleton                                                                      |

---

## Neumorphism Design System Guide

This section explains the neumorphism design principles used in this library and how to create custom components that match the style.

### What is Neumorphism?

Neumorphism (New + Skeuomorphism) is a design style that creates soft, extruded plastic-like UI elements using subtle shadows. Elements appear to be pushed out from or pressed into the background surface.

### Core Principles

#### 1. **Same Background Color**

The element and its parent must share the same (or very similar) background color. Neumorphism relies on shadows to create depth, not color contrast.

```css
/* ✅ Correct: Element blends with background */
.parent { background: hsl(220 20% 94%); }
.element { background: hsl(220 20% 94%); }

/* ❌ Wrong: High contrast breaks the illusion */
.parent { background: hsl(220 20% 94%); }
.element { background: white; }
```

#### 2. **Dual Shadow System**

Every neumorphic element needs TWO shadows:
- **Light shadow**: Positioned top-left, simulates light source
- **Dark shadow**: Positioned bottom-right, creates depth

```css
/* Light mode shadows */
--shadow-light: 255, 255, 255;  /* White highlight */
--shadow-dark: 200, 200, 210;   /* Soft gray shadow */

/* Raised/Flat element (appears to pop out) */
.raised {
  box-shadow: 
    -6px -6px 12px hsl(var(--shadow-light)),
    6px 6px 12px hsl(var(--shadow-dark));
}

/* Pressed/Inset element (appears sunken) */
.pressed {
  box-shadow: 
    inset -4px -4px 8px hsl(var(--shadow-light)),
    inset 4px 4px 8px hsl(var(--shadow-dark));
}
```

#### 3. **Consistent Light Source**

Always assume light comes from the **top-left**. This means:
- Light/highlight shadow: negative X, negative Y (-X, -Y)
- Dark shadow: positive X, positive Y (+X, +Y)

```css
/* Light from top-left */
box-shadow: 
  -6px -6px 12px hsl(var(--shadow-light)),  /* Top-left: highlight */
  6px 6px 12px hsl(var(--shadow-dark));      /* Bottom-right: shadow */
```

### CSS Variables Reference

The library uses these CSS variables for theming:

```css
:root {
  /* Background */
  --background: 220 20% 94%;
  --foreground: 220 15% 20%;
  
  /* Shadow colors (RGB values) */
  --shadow-light: 255, 255, 255;
  --shadow-dark: 200, 200, 210;
  
  /* Primary color HSL components */
  --primary-h: 217;
  --primary-s: 70%;
  --primary-l: 55%;
  --primary: var(--primary-h) var(--primary-s) var(--primary-l);
  
  /* For inner lighting on colored elements */
  --primary-light: var(--primary-h) var(--primary-s) 70%;
  --primary-dark: var(--primary-h) var(--primary-s) 35%;
}

.dark {
  --background: 220 15% 13%;
  --foreground: 220 10% 90%;
  --shadow-light: 50, 50, 55;
  --shadow-dark: 15, 15, 18;
}
```

### Building Custom Components

#### Basic Raised Button

```tsx
function MyButton({ children }) {
  return (
    <button
      className={`
        px-6 py-3 rounded-xl
        bg-background text-foreground
        font-medium
        shadow-[-4px_-4px_8px_hsl(var(--shadow-light)),4px_4px_8px_hsl(var(--shadow-dark))]
        hover:shadow-[-6px_-6px_12px_hsl(var(--shadow-light)),6px_6px_12px_hsl(var(--shadow-dark))]
        active:shadow-[inset_-4px_-4px_8px_hsl(var(--shadow-light)),inset_4px_4px_8px_hsl(var(--shadow-dark))]
        transition-shadow duration-200
      `}
    >
      {children}
    </button>
  );
}
```

#### Colored Neumorphic Button

For colored elements, you need **inner lighting** to maintain the 3D effect:

```tsx
function MyPrimaryButton({ children }) {
  return (
    <button
      className={`
        px-6 py-3 rounded-xl
        bg-primary text-primary-foreground
        font-medium
        shadow-[
          -4px_-4px_8px_hsl(var(--shadow-light)),
          4px_4px_8px_hsl(var(--shadow-dark)),
          inset_2px_2px_4px_hsl(var(--primary-light)),
          inset_-2px_-2px_4px_hsl(var(--primary-dark)/0.5)
        ]
        transition-shadow duration-200
      `}
    >
      {children}
    </button>
  );
}
```

**Key insight**: Colored elements combine:
1. Outer shadows (for raising from surface)
2. Inner highlight (top-left, lighter shade of the color)
3. Inner shadow (bottom-right, darker shade of the color)

#### Input Field (Pressed/Inset)

Input fields should appear "pressed into" the surface:

```tsx
function MyInput(props) {
  return (
    <input
      {...props}
      className={`
        w-full px-4 py-3 rounded-xl
        bg-background text-foreground
        border-none outline-none
        shadow-[inset_-3px_-3px_6px_hsl(var(--shadow-light)),inset_3px_3px_6px_hsl(var(--shadow-dark))]
        focus:shadow-[inset_-4px_-4px_8px_hsl(var(--shadow-light)),inset_4px_4px_8px_hsl(var(--shadow-dark))]
        transition-shadow duration-200
        placeholder:text-muted-foreground
      `}
    />
  );
}
```

#### Card Component

```tsx
function MyCard({ children, variant = "flat" }) {
  const variants = {
    flat: "shadow-[-6px_-6px_12px_hsl(var(--shadow-light)),6px_6px_12px_hsl(var(--shadow-dark))]",
    pressed: "shadow-[inset_-4px_-4px_8px_hsl(var(--shadow-light)),inset_4px_4px_8px_hsl(var(--shadow-dark))]",
  };

  return (
    <div
      className={`
        p-6 rounded-2xl
        bg-background
        ${variants[variant]}
      `}
    >
      {children}
    </div>
  );
}
```

### Shadow Size Guidelines

| Element Type | Shadow Size | Use Case |
|--------------|-------------|----------|
| Small (sm)   | 3-4px       | Small buttons, toggles, badges |
| Default      | 6px         | Regular buttons, cards, inputs |
| Large (lg)   | 8-12px      | Hero cards, modals, prominent elements |
| Extra Large  | 12-16px     | Full-width sections, page containers |

### State Transitions

#### Hover State
Increase shadow distance slightly to make element appear to "lift up":

```css
.element {
  shadow: -4px -4px 8px ..., 4px 4px 8px ...;
}
.element:hover {
  shadow: -6px -6px 12px ..., 6px 6px 12px ...;
}
```

#### Active/Pressed State
Switch from outer shadow to inner shadow:

```css
.element:active {
  shadow: inset -4px -4px 8px ..., inset 4px 4px 8px ...;
}
```

#### Focus State
Add a subtle ring or increase shadow intensity:

```css
.element:focus {
  shadow: -6px -6px 12px ..., 6px 6px 12px ...;
  /* OR add a focus ring */
  ring: 2px;
  ring-color: primary;
}
```

### Dark Mode Considerations

In dark mode:
1. **Reduce shadow contrast**: Shadows should be more subtle
2. **Adjust shadow colors**: Use darker grays, not pure black
3. **Light shadow becomes a dim highlight**: Still lighter than background, but muted

```css
.dark {
  --shadow-light: 50, 50, 55;   /* Dim gray, not white */
  --shadow-dark: 15, 15, 18;    /* Very dark gray, not black */
}
```

### Common Mistakes to Avoid

1. **❌ Using white background on elements**
   - Use `bg-background` instead of `bg-white`

2. **❌ Forgetting inner shadows on colored buttons**
   - Always add `--primary-light` and `--primary-dark` inner shadows

3. **❌ Inconsistent shadow directions**
   - Always: light top-left (-X, -Y), dark bottom-right (+X, +Y)

4. **❌ Too harsh shadows**
   - Keep blur radius >= distance (e.g., 6px offset needs 12px blur)

5. **❌ Missing transitions**
   - Always add `transition-shadow duration-200` for smooth hover effects

### Template: Creating a New Component

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const myComponentVariants = cva(
  // Base styles
  "rounded-xl bg-background transition-all duration-200",
  {
    variants: {
      variant: {
        flat: [
          "shadow-[-4px_-4px_8px_hsl(var(--shadow-light)),4px_4px_8px_hsl(var(--shadow-dark))]",
          "hover:shadow-[-6px_-6px_12px_hsl(var(--shadow-light)),6px_6px_12px_hsl(var(--shadow-dark))]",
        ].join(" "),
        pressed: [
          "shadow-[inset_-3px_-3px_6px_hsl(var(--shadow-light)),inset_3px_3px_6px_hsl(var(--shadow-dark))]",
        ].join(" "),
      },
      size: {
        sm: "p-3 text-sm",
        default: "p-4",
        lg: "p-6 text-lg",
      },
    },
    defaultVariants: {
      variant: "flat",
      size: "default",
    },
  }
);

export interface MyComponentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof myComponentVariants> {}

const MyComponent = React.forwardRef<HTMLDivElement, MyComponentProps>(
  ({ className, variant, size, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(myComponentVariants({ variant, size, className }))}
      {...props}
    />
  )
);
MyComponent.displayName = "MyComponent";

export { MyComponent, myComponentVariants };
```

---

## TypeScript Support

All components are fully typed. You can import types directly:

```tsx
import type {
  ButtonProps,
  CardProps,
  InputProps,
  SelectProps,
  FileUploadProps,
  // ... etc
} from "gisketch-neumorphism";
```

---

## Customization

### Overriding Styles

All components accept a `className` prop for custom styling:

```tsx
<Button className="bg-purple-500 hover:bg-purple-600">
  Custom Button
</Button>
```

### CSS Variables

You can override the neumorphic design tokens in your CSS:

```css
:root {
  /* Override shadow colors */
  --shadow-light: 255, 255, 255;
  --shadow-dark: 200, 200, 200;

  /* Override primary color */
  --primary-h: 220;
  --primary-s: 70%;
  --primary-l: 50%;
}

.dark {
  --shadow-light: 60, 60, 60;
  --shadow-dark: 20, 20, 20;
}
```

---

## Publishing to npm

When you're ready to publish your library:

```bash
# Build the library
npm run build

# Login to npm (if not already)
npm login

# Publish
npm publish
```

Make sure to update the `version` in `package.json` before each publish.

---

## Development

To run the component viewer locally:

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

Visit `http://localhost:5173` to see all components.
