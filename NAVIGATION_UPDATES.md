# Navigation Links Update

Add these links to your `Header` or navigation component:

## For Users (Everyone)
```javascript
<Link href="/classes">
  <Button variant="ghost" size="sm">Upcoming Classes</Button>
</Link>
```

## For Admins Only (Add to Header)
```javascript
{isAdmin && (
  <Link href="/admin/classes">
    <Button variant="ghost" size="sm">Manage Classes</Button>
  </Link>
)}
```

## Complete Navigation Update for Header.jsx

Add this to your header component's navigation items:

```javascript
// In your navigation menu
const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Classes', href: '/classes' },
  { label: 'Dashboard', href: '/dashboard' },
  // ... other items
];

// For admin only
if (isAdmin) {
  navItems.push(
    { label: 'Manage Classes', href: '/admin/classes' }
  );
}
```

## Quick Links to Add

### Mobile Menu
- View Upcoming Classes → `/classes`
- Manage Classes (admin only) → `/admin/classes`

### Desktop Header
- Classes dropdown/link
- Dashboard link (existing)

### Footer
- Optional: Add "Classes" link to footer

---

**Example in Header Component:**

```jsx
<nav className="flex gap-2 items-center">
  <Link href="/">Home</Link>
  <Link href="/classes">Classes</Link>
  <Link href="/dashboard">Dashboard</Link>
  {user && user.role === 'admin' && (
    <Link href="/admin/classes">Manage Classes</Link>
  )}
  {user ? (
    <DropdownMenu>
      {/* ... user menu */}
    </DropdownMenu>
  ) : (
    <Link href="/login">Login</Link>
  )}
</nav>
```
