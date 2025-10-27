import React, { useState, useEffect, useRef } from 'react';
let Room, RoomEvent, Track;

const loadLiveKit = async () => {
  try {
    const livekit = await import('livekit-client');
    Room = livekit.Room;
    RoomEvent = livekit.RoomEvent;
    Track = livekit.Track;
    return true;
  } catch (err) {
    console.error('LiveKit not installed. Run: npm install livekit-client');
    return false;
  }
};

export default loadLiveKit