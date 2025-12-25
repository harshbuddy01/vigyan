# Dropdown Navigation Implementation Guide

## Quick Setup

To add the dropdown menu to any page:

### 1. Include the CSS
Add this in your `<head>` section:
```html
<link rel="stylesheet" href="shared-nav-dropdown.css">
```

### 2. Update Your Navigation
Replace the "Future Career" link with this structure:

```html
<div class="nav-dropdown">
    <a href="#" class="dropdown-trigger">Future Career <i class="fas fa-chevron-down"></i></a>
    <div class="dropdown-menu">
        <a href="future.html">Future Career</a>
        <a href="sciencenews.html">Science News</a>
    </div>
</div>
```

### 3. Ensure FontAwesome is loaded
Make sure you have this in your `<head>`:
```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
```

## Pages Updated
- ✅ index.html
- ✅ sciencenews.html 
- [ ] aboutpage.html
- [ ] future.html
- [ ] subtittlepyq.html
- [ ] testfirstpage.html
- [ ] iiserpyqhome.html
- [ ] isipyqhome.html
- [ ] connetecdpyq.html
- [ ] exam.html
- [ ] instructions.html

## Customization

You can customize colors and styles by editing `shared-nav-dropdown.css`

### Example for different themes:
```css
/* Dark theme */
.dropdown-menu {
    background: rgba(20, 20, 30, 0.95);
}

/* Light theme */
.dropdown-menu {
    background: rgba(255, 255, 255, 0.95);
    color: #000;
}
```
