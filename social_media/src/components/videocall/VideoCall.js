import React, { useEffect, useState, useRef } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import axios from "axios";

const VideoCall = () => {
  const [meetingData, setMeetingData] = useState(null);
  const containerRef = useRef(null);
  const roomID = "testroom123"; // Static room ID (or dynamic from route)

  const query = `
    query joinvideocall($roomID: String!) {
      joinvideocall(roomID: $roomID) {
        token
        userID
        username
        appID
        serverSecret
      }
    }
  `;

  const variables = { roomID : roomID };

  const fetchToken = async () => {
  try {
    const response = await axios.post(
      "http://localhost:5000/graphql",
      { query, variables },
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }
    );

    if (response.data.errors) {
      console.error("GraphQL Error:", response.data.errors);
      return;
    }
    
    const data = response?.data?.data?.joinvideocall;

    if (data) {
      setMeetingData(data);
        try{
      if(!data){ return alert(" missing the fiel... ")}
      const {  appID, serverSecret, userID, username } = data;

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        roomID,
        userID,
        username
      );

      const zp = ZegoUIKitPrebuilt.create(kitToken);

      zp.joinRoom({
        container: containerRef.current,
        scenario: {
          mode: ZegoUIKitPrebuilt.OneONoneCall,
        },
        showScreenSharingButton: true,
        showAudioVideoSettingsButton: true,
        showLeavingView: true,
      showPreJoinView : false,
      });
    }
  
  catch(err){
  alert(err)
  }

    } else {
      console.error("Invalid data from server:", data);
    }
  } catch (err) {
    console.error("Error fetching Zego token:", err);
  }
};

  useEffect(() => {
    fetchToken();
  }, []);


  // useEffect(() => {
  //   const startVideoCall = async () => {
  //     // const appID = 597010418;
  //     // const serverSecret = 'ea49ed3eff4b61060c1ccc683e39a79d';
  //     // const userID = Date.now().toString();
  //     // const username = 'MohitPapa';
  //     try{
  //     const {  appID, serverSecret, userID, username } = meetingData;
  //     if(!appID || !serverSecret || !userID | !username){ return alert(" missing the fiel... ")}

  //     const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
  //       appID,
  //       serverSecret,
  //       roomID,
  //       userID,
  //       username
  //     );

  //     const zp = ZegoUIKitPrebuilt.create(kitToken);

  //     zp.joinRoom({
  //       container: containerRef.current,
  //       scenario: {
  //         mode: ZegoUIKitPrebuilt.OneONoneCall,
  //       },
  //       showScreenSharingButton: false,
  //       showAudioVideoSettingsButton: true,
  //       showLeavingView: true,
  //     showPreJoinView : false,
  //     });
  //   }
  
  // catch(err){
  // alert(err)
  // }

  //   }
  //   startVideoCall();
  // }, []);

  return (
    <div>
      <div ref={containerRef} style={{ width: "100%", height: "500px" }} />
    </div>
  );
};

export default VideoCall;
