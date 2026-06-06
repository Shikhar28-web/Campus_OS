# 📱 Access CampusOS on Mobile

## Current Status
✅ Both servers are running!
- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:5173

## Access from Your Mobile Device

### Step 1: Connect to Same WiFi
Make sure your mobile device is connected to the **same WiFi network** as your computer.

### Step 2: Find Your PC's IP Address
Your PC has these network IPs:
- `10.2.204.89`
- `172.16.0.2`
- `172.26.208.1`

### Step 3: Open on Mobile

Try each of these URLs on your mobile browser until one works:

**Option 1:**
```
http://10.2.204.89:5173
```

**Option 2:**
```
http://172.16.0.2:5173
```

**Option 3:**
```
http://172.26.208.1:5173
```

### Step 4: Test Backend Connection

To verify the backend is accessible, try these URLs first:

**Backend Health Check:**
- http://10.2.204.89:5000/health
- http://172.16.0.2:5000/health
- http://172.26.208.1:5000/health

You should see: `{"status":"ok","timestamp":"..."}`

## Troubleshooting

### Mobile Can't Connect?

1. **Check Firewall**
   - Windows Firewall might be blocking connections
   - Go to Windows Defender Firewall → Allow an app
   - Add Node.js if not already allowed

2. **Check WiFi**
   - Ensure both devices are on the **same network**
   - Don't use VPN on either device

3. **Try Different IP**
   - Your PC might have multiple network adapters
   - Try all three IPs listed above

4. **Check Port Access**
   Run this on your PC to verify ports are open:
   ```bash
   netstat -an | findstr "5000 5173"
   ```

### Frontend Loads But No Data?

The frontend automatically detects your IP and connects to the backend on the same IP.

- Frontend on mobile: `http://10.2.204.89:5173`
- Auto-connects to: `http://10.2.204.89:5000/api`

## Quick Demo URLs

**On PC (localhost):**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

**On Mobile (network):**
- Frontend: http://10.2.204.89:5173 (or try other IPs)
- Backend: http://10.2.204.89:5000 (auto-connected)

## Current Features Working

✅ Dashboard with 5 sample tasks
✅ Life Inbox (add manual notes)
✅ Focus Engine (AI recommendations)
✅ Academic Pulse (performance tracking)
✅ Voice Capture (with mock transcription)
✅ Task Details (step tracking)
✅ Dark/Light theme toggle

## Demo for Mentor

1. Show Dashboard with tasks
2. Navigate to Academic Pulse
3. Show Focus Engine recommendation
4. Demonstrate theme toggle
5. Show mobile responsiveness
6. Open Life Inbox and add a manual note
7. Show task creation flow

**Enjoy! 🎉**
