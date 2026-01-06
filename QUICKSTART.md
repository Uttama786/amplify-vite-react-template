# Quick Start Guide - New Features

## ⚡ Quick Setup (5 minutes)

### Step 1: Update Backend
```bash
# Restart Amplify sandbox to apply schema changes
npx ampx sandbox
```

Wait for deployment to complete (you'll see "Deployed successfully" message).

### Step 2: Refresh Browser
```bash
# If dev server is running, just refresh browser
# Otherwise start dev server:
npm run dev
```

### Step 3: Test New Features

#### ✅ Test Reminders:
1. Click 📅 button when adding todo
2. Set reminder for 2 minutes from now
3. Add the todo
4. Accept browser notification permission
5. Wait for notification!

#### ✅ Test Priorities:
1. Click 📅 button
2. Select different priorities (🟢🟡🔴)
3. Add multiple todos
4. See them sorted by priority!

#### ✅ Test Admin Panel:
1. Open database console (or use manual SQL)
2. Set your user's `isAdmin` field to `true`
3. Refresh browser
4. Click **⚙️ Admin** button
5. Manage users!

## 🎬 Usage Examples

### Example 1: Create High Priority Todo with Reminder
```
1. Type: "Complete project presentation"
2. Click 📅
3. Select: 🔴 High
4. Due Date: Tomorrow 5:00 PM
5. Reminder: Tomorrow 3:00 PM
6. Click "Add Todo"
```

### Example 2: Enable Notifications
```
1. Click 🔔 in header
2. Click "Allow" in browser prompt
3. Bell icon turns solid (enabled)
4. You're ready to receive notifications!
```

### Example 3: Make Someone Admin (as Admin)
```
1. Click ⚙️ Admin
2. Find user in list
3. Click "⬆️ Make Admin"
4. User now has admin powers!
```

## 🚨 First-Time Admin Setup

### Option 1: Direct Database Update (Recommended)
```bash
# If using AWS Console:
1. Go to AWS AppSync Console
2. Find your API
3. Go to "Data Sources"
4. Find User table
5. Edit your user record
6. Set isAdmin = true
7. Save

# If using AWS CLI:
aws dynamodb update-item \
    --table-name <YourUserTable> \
    --key '{"id": {"S": "<your-user-id>"}}' \
    --update-expression "SET isAdmin = :val" \
    --expression-attribute-values '{":val": {"BOOL": true}}'
```

### Option 2: Create Admin User Manually
After first login, update in AppSync console or use the database directly.

## 📱 Testing Notifications

### Test Browser Notifications:
```javascript
// Open browser console (F12) and run:
new Notification('Test', {
  body: 'If you see this, notifications work!',
  icon: '/vite.svg'
});
```

If you see the notification, it's working! ✅

### Test Reminder Flow:
1. Create todo with reminder in 1-2 minutes
2. Keep browser tab open
3. Wait for reminder time
4. You should see notification pop up!

## 🎯 Key Features Quick Reference

| Feature | Button/Icon | Location |
|---------|-------------|----------|
| Add Reminder | 📅 | Next to "Add Todo" button |
| Notifications | 🔔/🔕 | Header, next to email |
| Admin Panel | ⚙️ Admin | Header (admin only) |
| Priority | 🟢🟡🔴 | In date picker section |
| Edit Todo | ✏️ | Right side of todo item |
| Delete Todo | 🗑️ | Right side of todo item |

## 🔧 Common Issues & Quick Fixes

### Issue: "Notification" Not Working
**Fix:** Allow notifications in browser settings
```
Chrome: Settings → Privacy → Site Settings → Notifications
Firefox: Settings → Privacy → Permissions → Notifications
```

### Issue: Admin Button Not Showing
**Fix:** Check if user is admin
```
1. Verify isAdmin = true in database
2. Refresh browser (Ctrl+R)
3. Clear cache if needed (Ctrl+Shift+R)
```

### Issue: Reminders Not Triggering
**Fix:** Check these:
- [ ] Notification permission granted
- [ ] Notification toggle enabled (🔔)
- [ ] Reminder date is in future
- [ ] Browser tab is open
- [ ] Check browser console for errors

### Issue: Schema Changes Not Applied
**Fix:** 
```bash
# Stop sandbox
Ctrl+C

# Clear and restart
npx ampx sandbox --clean
```

## 🎨 Feature Showcase

### Priority System:
- **High**: 🔴 Red badge - Urgent tasks
- **Medium**: 🟡 Yellow badge - Normal tasks
- **Low**: 🟢 Green badge - When you have time

### Date Display:
- **Due Date**: 📅 Blue badge with date/time
- **Reminder**: ⏰ Yellow badge with date/time
- **Sent**: ✓ Green badge (reminder already sent)

### Admin Badges:
- **Admin Users**: 👑 Gold crown badge
- **Regular Users**: 👤 Gray badge
- **Notifications**: 🔔 Enabled / 🔕 Disabled

## 💡 Pro Tips

1. **Keyboard Shortcuts:**
   - `Enter` to add todo quickly
   - `Double-click` todo text to edit
   - `Escape` to cancel editing

2. **Batch Operations:**
   - Filter by Active/Completed
   - "Clear Completed" removes all done todos at once

3. **Admin Efficiency:**
   - Sort users by admin status
   - Bulk promote multiple users quickly
   - Monitor notification preferences

4. **Reminder Best Practices:**
   - Set reminder 15-30 mins before due date
   - Use High priority for important reminders
   - Keep browser tab open for notifications

## 🚀 Next Steps

1. ✅ Set up your first reminder
2. ✅ Test browser notifications
3. ✅ Promote first admin user
4. ✅ Configure email (optional)
5. ✅ Invite team members
6. ✅ Start organizing with priorities!

## 📚 Full Documentation

For detailed setup and configuration, see:
- **FEATURES.md** - Complete feature documentation
- **README.md** - Project overview
- **amplify/functions/sendReminder/** - Email configuration

---

**Need Help?** Check browser console (F12) for error messages!

**Pro Tip:** Star the repository and share with your team! ⭐
