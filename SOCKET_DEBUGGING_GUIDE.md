# Socket Event Debugging Guide

## Problem
- Viewer sends comment → Backend receives it → Backend broadcasts it
- Viewer receives the broadcast ✅
- Host does NOT receive the broadcast ❌

## Frontend Changes Made

### HostLiveStream.jsx
1. ✅ Enhanced socket listener setup with better debugging
2. ✅ Added `onAny` listener to catch ALL socket events
3. ✅ Added manual handler trigger if event is received but listener doesn't fire
4. ✅ Enhanced tip-received listener with debugging

### ViewerLiveStream.jsx
1. ✅ Enhanced comment sending with better logging
2. ✅ Added socket state verification before emitting

## Backend Checks Required

### 1. Verify Room Management
```javascript
// When host joins stream
socket.on('join-stream', async (data) => {
  const { streamId, isStreamer } = data;
  
  // CRITICAL: Host must join the SAME room as viewers
  const roomName = `stream-${streamId}`;
  await socket.join(roomName);
  
  console.log(`✅ Host joined room: ${roomName}, Socket ID: ${socket.id}`);
  
  // Verify room membership
  const room = io.sockets.adapter.rooms.get(roomName);
  console.log(`Room members: ${room ? room.size : 0}`);
});
```

### 2. Verify Comment Broadcasting
```javascript
// When viewer sends comment
socket.on('send-comment', async (data) => {
  const { streamId, text } = data;
  const roomName = `stream-${streamId}`;
  
  // Save comment to database
  const comment = await saveComment(streamId, text, userId);
  
  // CRITICAL: Broadcast to ALL sockets in the room (host + viewers)
  io.to(roomName).emit('new-comment', {
    _id: comment._id,
    id: comment._id,
    username: user.username,
    text: comment.text,
    timestamp: comment.createdAt,
    userId: user._id
  });
  
  console.log(`📤 Broadcasting new-comment to room: ${roomName}`);
  console.log(`Room size: ${io.sockets.adapter.rooms.get(roomName)?.size || 0}`);
});
```

### 3. Verify Tip/Gift Broadcasting
```javascript
// When viewer sends tip/gift
socket.on('send-tip', async (data) => {
  const { streamId, amount, giftType } = data;
  const roomName = `stream-${streamId}`;
  
  // Process tip
  const result = await processTip(streamId, amount, giftType, userId);
  
  // CRITICAL: Broadcast to host
  io.to(roomName).emit('tip-received', {
    tipper: { username: user.username },
    amount: result.amount,
    giftType: giftType,
    timestamp: Date.now()
  });
  
  // Update host's coin balance
  io.to(roomName).emit('coins-updated', {
    streamId,
    coinBalance: result.hostBalance,
    earnedAmount: result.amount
  });
  
  console.log(`🎁 Broadcasting tip-received to room: ${roomName}`);
});
```

### 4. Common Issues to Check

#### Issue 1: Different Room Names
- Host joins: `stream-${streamId}`
- Viewers join: `stream-${streamId}`
- **Must be EXACTLY the same!**

#### Issue 2: Namespace Mismatch
- Check if using namespaces: `/live` vs `/`
- All sockets must be in the same namespace

#### Issue 3: Socket Not in Room
- Verify host socket is actually in the room after `join-stream`
- Use: `io.sockets.adapter.rooms.get(roomName)`

#### Issue 4: Broadcasting to Wrong Room
- Use `io.to(roomName).emit()` not `socket.emit()`
- Use `io.to(roomName).emit()` not `socket.broadcast.emit()`

### 5. Debugging Commands for Backend

Add these console logs to verify:

```javascript
// After host joins
socket.on('join-stream', async (data) => {
  const roomName = `stream-${data.streamId}`;
  await socket.join(roomName);
  
  const room = io.sockets.adapter.rooms.get(roomName);
  console.log(`📊 Room ${roomName}:`);
  console.log(`  - Total sockets: ${room?.size || 0}`);
  console.log(`  - Socket IDs:`, Array.from(room || []));
});

// Before broadcasting comment
socket.on('send-comment', async (data) => {
  const roomName = `stream-${data.streamId}`;
  const room = io.sockets.adapter.rooms.get(roomName);
  
  console.log(`📤 Broadcasting comment to room: ${roomName}`);
  console.log(`  - Room exists: ${!!room}`);
  console.log(`  - Room size: ${room?.size || 0}`);
  console.log(`  - Socket IDs in room:`, Array.from(room || []));
  
  io.to(roomName).emit('new-comment', commentData);
});
```

## Testing Steps

1. **Start backend with enhanced logging**
2. **Host starts stream** - Check logs for:
   - `✅ Host joined room: stream-{streamId}`
   - Room size should be 1
3. **Viewer joins stream** - Check logs for:
   - `✅ Viewer joined room: stream-{streamId}`
   - Room size should be 2
4. **Viewer sends comment** - Check logs for:
   - `📤 Broadcasting new-comment to room: stream-{streamId}`
   - Room size should still be 2
   - Socket IDs should include both host and viewer
5. **Check frontend console**:
   - Host should see: `🔍 HOST: Received socket event via onAny: new-comment`
   - If you see this but comment doesn't show, it's a frontend issue
   - If you DON'T see this, it's a backend broadcasting issue

## Expected Backend Logs

```
✅ Host joined room: stream-6960a3cac0df070163ab4070
Room members: 1
✅ Viewer joined room: stream-6960a3cac0df070163ab4070
Room members: 2
📤 Broadcasting new-comment to room: stream-6960a3cac0df070163ab4070
Room size: 2
Socket IDs in room: ['host-socket-id', 'viewer-socket-id']
```

## If Still Not Working

1. Check if backend is using Socket.IO v4+ (different API)
2. Verify CORS settings allow socket connections
3. Check if there are multiple socket.io instances
4. Verify authentication isn't blocking events
5. Check if there's middleware filtering events
