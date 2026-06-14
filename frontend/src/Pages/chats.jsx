import { Search } from "lucide-react";
import { getAllNotificationCount, getFreindRequests, getMessages, getProfile, getUserChats, getUserStatus, sendMessage } from "../components/getServices";
import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { UserPlus, Inbox } from "lucide-react";
import { Bell } from "lucide-react";



export const Chats = () => {

    const navigate = useNavigate()
    const[myChats,setMychats] = useState([])
    const[messages,setMessages] = useState([])

    const[socket,setSocket] = useState(null)

    const[selectedChat,setSelectedChat] = useState(null)

    const [messageText, setMessageText] = useState("");

    const[myId,setMyId] = useState(null)

    const[userStatus,setUserStatus] = useState(null)

    const[userSearch,setUserSearch] = useState("")

    const[requests,setRequests] = useState([])

    const [notificationCount, setNotificationCount] = useState(0);

    const[mydetails,setMyDeatils] = useState({})


    const[isTyping,setIsTyping] = useState(false)
    const bottomRef = useRef(null)
    const myIdRef = useRef(null);
    const selectedChatRef = useRef(null);

    const [showChatWindow,setShowChatWindow] = useState(false);

    useEffect(() => {

    bottomRef.current?.scrollIntoView({
        behavior: "smooth"
    });

}, [messages]);

    useEffect(()=>{
         const token = localStorage.getItem("jwt");
         const ws = new WebSocket(`wss://realtime-chat-app-3xd6.onrender.com/ws?token=${token}`);

         ws.onopen = () => {
            console.log("CONNECTED");
         }

         ws.onerror = (error) => {
            console.log("WS ERROR", error);
        };

        ws.onmessage = (event) => {

            const data = JSON.parse(event.data);


            if(data.type === "typing"){

                setIsTyping(true);

                setTimeout(() => {
                    setIsTyping(false);
                },1000);

            }
                  else if(data.type === "seen"){

                   

              setMessages((prev)=>{


                  return prev.map((msg)=>
                      msg.sender_id === myIdRef.current
                          ? {...msg,is_read:true}
                          : msg
                  );
              });
                    }
                    else if(data.type === "notification"){

    console.log(
        "NOTIFICATION EVENT RECEIVED"
    );

    getNotificationCount()

}
            else{

                  setMessages((prev)=>[...prev,data]);
                  getMyChats()



                          if(
                              selectedChatRef.current &&
                              selectedChatRef.current.chat_id === data.chat_id
                          ){
                              getChatMessages(selectedChatRef.current.chat_id);
                          }



              }

              }
            
         setSocket(ws);

         return () => { ws.close(); }
    },[])

    const formatLastSeen = (lastSeen) => {

    if (!lastSeen) return "";

    const date = new Date(lastSeen);
    const now = new Date();

    const isToday =
        date.toDateString() === now.toDateString();

    if (isToday) {
        return `Last Seen Today at ${date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        })}`;
    }

    return `Last Seen ${date.toLocaleString()}`;
};

const getUserRequests = async() => {
        try {
            const token = localStorage.getItem("jwt");
            const res = await getFreindRequests(token);
            if(res.status>=200 && res.status<300){
              console.log("DATA:",res.data)
                setRequests(res.data)
            }else{
                navigate("/login")
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(()=>{
        getUserRequests()
    },[])
    const getMyChats = async() => {
        try {
            const token = localStorage.getItem("jwt");
            // console.log(token)
            const res = await getUserChats(token);
            // console.log(res)
            if(res.status >= 200 && res.status < 300){
                setMychats(res.data)
            }else{
                // console.log(res);
                navigate("/login")
            }

            
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(()=>{
        getMyChats()
    },[])

    const getChatMessages = async(chatid) => {
        try {
             const token = localStorage.getItem("jwt");
            const res = await getMessages(chatid,token);
            // console.log(res)
             if(res.status >= 200 && res.status < 300){
                setMessages(res.data)
                await getMyChats();
            }else{
                // console.log(res);
                navigate("/login")
            }

        } catch (error) {
            console.log(error);
            navigate("/login")
        }
    }

    

    const sendUserMessage = async() => {
        try {
            const token = localStorage.getItem("jwt");
            const data = {
                chat_id:selectedChat.chat_id,
                message_text:messageText
            }
            const res = await sendMessage(data,token);
            if(res.status>=200 && res.status<300){

                  setMessages((prev)=>[
                      ...prev,
                      res.data
                  ]);

                  setMessageText("");
              }
        } catch (error) {
            console.log(error)
            setMessageText("")
        }
    }


    const handleMessageSend = (e) => {
        e.preventDefault();
        // console.log(messageText)
        sendUserMessage()
    }

    const getNotificationCount = async(token) => {
      try {
        const token = localStorage.getItem("jwt");
        const res = await getAllNotificationCount(token);

        if(res.status>=200 && res.status<300){
          setNotificationCount(res.data.count);
        }else{
          navigate("/login");
        }
      } catch (error) {
        console.log(error);
      }
    }
    useEffect(() => {

    const handlePopState = () => {

        if(showChatWindow){

            setShowChatWindow(false);

            setSelectedChat(null);

        }

    };

    window.addEventListener(
        "popstate",
        handlePopState
    );

    return () => {

        window.removeEventListener(
            "popstate",
            handlePopState
        );

    };

}, [showChatWindow]);


    const getUserId = async() => {
      try {
        const token = localStorage.getItem("jwt")
        const res = await getProfile(token);
        if(res.status>=200 && res.status<300){
          setMyId(res.data.id)
          setMyDeatils(res.data)
        }else{
            navigate("/login")
        }
      } catch (error) {
        console.log(error);
        navigate("/login")

      }
    }

    useEffect(()=>{
      getUserId()
    },[])

    useEffect(()=>{
        myIdRef.current = myId;
    },[myId]);

    useEffect(()=>{
    selectedChatRef.current = selectedChat;
},[selectedChat]);

    const getUserOnlineStatus = async(id) => {
      try {
        const res = await getUserStatus(id)
        if(res.status>=200 && res.status<300){
            setUserStatus(res.data)
        }
      } catch (error) {
        console.log(error)
      }
    }

    useEffect(()=>{
      if(selectedChat){
        getUserOnlineStatus(selectedChat.user_id);
            getChatMessages(selectedChat.chat_id);

      }
    },[selectedChat])

    const searchUsers = myChats.filter((curr)=>
        curr.username.toLowerCase().includes(userSearch.toLowerCase())
    )


     return (
    <div className="h-screen bg-gray-950">

      <div className="h-full flex">

        {/* Sidebar */}
        <div
  className={`
    ${showChatWindow ? "hidden" : "flex"}
    md:flex
    w-full
    md:w-96
    bg-gray-900
    border-r
    border-gray-800
    flex-col
  `}
>

          {/* Profile Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-800">

    {/* Left Side */}
    <div className="flex items-center gap-4">
        <NavLink to="/profile">
        <div
            className="
                w-10
                h-10
                rounded-full
                bg-blue-600
                flex
                items-center
                justify-center
                text-white
                font-bold
            "
        >
            {
              mydetails.profile_photo_url?<img src={mydetails?.profile_photo_url} />:<span>{mydetails.username?.charAt(0)?.toUpperCase() || " "}</span>
            }
        </div>
        </NavLink>
        <div>

            <h2 className="text-white font-semibold">
                {mydetails.username}
            </h2>

            <p className="text-green-500 text-sm">
                Online
            </p>

        </div>

    </div>

    {/* Right Side Icons */}
    <div className="flex items-center gap-3">

        {/* Find Users */}

        <button
    onClick={() => navigate("/notifications")}
    className="
        relative
        p-2
        rounded-lg
        text-gray-400
        hover:text-white
        hover:bg-gray-800
        transition
    "
>

    <Bell size={22} />

    {notificationCount > 0 && (

        <span
            className="
                absolute
                -top-1
                -right-1
                bg-red-600
                text-white
                text-[10px]
                font-bold
                w-5
                h-5
                rounded-full
                flex
                items-center
                justify-center
            "
        >
            {notificationCount}
        </span>

    )}

</button>

        <button
            onClick={() => navigate("/findusers")}
            className="
                p-2
                rounded-lg
                text-gray-400
                hover:text-white
                hover:bg-gray-800
                transition
            "
            title="Find Users"
        >
            <UserPlus size={22} />
        </button>

        {/* Requests */}

        <button
            onClick={() => navigate("/requests")}
            className="
                relative
                p-2
                rounded-lg
                text-gray-400
                hover:text-white
                hover:bg-gray-800
                transition
            "
            title="Friend Requests"
        >

            <Inbox size={22} />

            {/* Badge */}

            <span
                className="
                    absolute
                    -top-1
                    -right-1
                    bg-red-600
                    text-white
                    text-[10px]
                    font-bold
                    w-5
                    h-5
                    rounded-full
                    flex
                    items-center
                    justify-center
                "
            >
                {requests.length}
            </span>

        </button>

    </div>

</div>

          {/* Search Bar */}
          <div className="p-4">

            <div className="relative">

              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />

              <input
                type="text"
                placeholder="Search chats..."
                value={userSearch}
                onChange={(e)=>setUserSearch(e.target.value)}
                className="
                  w-full
                  bg-gray-800
                  text-white
                  placeholder-gray-500
                  pl-10
                  pr-4
                  py-3
                  rounded-xl
                  border
                  border-gray-700
                  focus:outline-none
                  focus:ring-2
                  focus:ring-blue-500
                "
              />

            </div>

          </div>

          {/* Chats List */}
          <div className="flex-1 overflow-y-auto">

            {searchUsers.map((chat) => (
              <div
                key={chat.chat_id}
                onClick={() => {

    setSelectedChat(chat);

    setShowChatWindow(true);

    window.history.pushState(
        {},
        ""
    );

}}
                className={`
    flex items-center gap-3 px-4 py-4 cursor-pointer
    ${
      selectedChat?.chat_id === chat.chat_id
        ? "bg-gray-800"
        : "hover:bg-gray-800"
    }
`}
              >

                <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold overflow-hidden">
  {chat?.profile_photo_url ? (
    <img
      src={chat.profile_photo_url}
      alt={chat.username}
      className="w-full h-full object-cover rounded-full"
    />
  ) : (
    <span>
      {chat.username?.charAt(0)?.toUpperCase() || " "}
    </span>
  )}
</div>


                <div className="flex-1 min-w-0">

                  <div className="flex justify-between items-center">

    <h3 className="font-medium text-white truncate">
        {chat.username}
    </h3>

    <div className="flex items-center gap-2">

        {chat.unread_count > 0 && (

            <div
                className="
                    min-w-[22px]
                    h-[22px]
                    px-1
                    rounded-full
                    bg-blue-600
                    flex
                    items-center
                    justify-center
                    text-white
                    text-xs
                    font-bold
                "
            >
                {chat.unread_count}
                          </div>

                      )}

                      <span className="text-xs text-gray-500">
                          {chat.last_message_time}
                      </span>

                  </div>

              </div>

                  <p className="text-sm text-gray-400 truncate">
                    Last message preview...
                  </p>

                </div>

              </div>
            ))}

          </div>

        </div>

        {/* Right Side */}
        <div
  className={`
    ${showChatWindow ? "flex" : "hidden"}
    md:flex
    flex-1
    bg-gray-950
  `}
>

  {selectedChat ? (

    <div className="flex-1 bg-gray-950 flex flex-col">

  {/* Header */}
  {selectedChat && (
    <div className="h-20 border-b border-gray-800 bg-gray-900 flex items-center px-5 flex-shrink-0 gap-3">
      {/* <button
    onClick={() => {

        setShowChatWindow(false);

        setSelectedChat(null);

    }}
    className="
        md:hidden
        text-white
        text-2xl
        font-bold
    "
>
    ←
</button> */}

      <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold overflow-hidden">
  {selectedChat?.profile_photo_url ? (
    <img
      src={selectedChat.profile_photo_url}
      alt={selectedChat.username}
      className="w-full h-full object-cover rounded-full"
    />
  ) : (
    <span>
      {selectedChat.username?.charAt(0)?.toUpperCase() || " "}
    </span>
  )}
</div>


      <div className="ml-4">
        <div>

    <h2 className="font-semibold text-white">
    {selectedChat?.username}
</h2>

<p className="text-sm text-gray-400">

    {isTyping? "Typing...": userStatus?.is_online? "🟢 Online": formatLastSeen(userStatus?.last_seen)}

</p>

</div>

        <p className="text-sm text-gray-400">
          Chat ID: {selectedChat.chat_id}
        </p>
      </div>

    </div>
  )}

  {/* No Chat Selected */}
  {!selectedChat ? (
    <div className="flex-1 flex items-center justify-center">

      <div className="text-center">

        <div className="w-28 h-28 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-6">
          <span className="text-5xl">💬</span>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome Back
        </h1>

        <p className="text-gray-400">
          Select a chat to start messaging
        </p>

      </div>

    </div>
  ) : (
    <>
      {/* Messages Section */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">

        {messages.length > 0 ? (
          messages.map((msg,index) => (

            <div
        key={msg.msg_id || index}
        className={`flex ${
            msg.sender_id === myId
                ? "justify-end"
                : "justify-start"
        }`}
    >

        

         <div
            className={`
                px-4
                py-3
                rounded-2xl
                max-w-md
                break-words
                ${
                    msg.sender_id === myId
                        ? "bg-blue-600 text-white"
                        : "bg-gray-800 text-white"
                }
            `}
        >

            <p>{msg.message_text}</p>

            {msg.sender_id === myId && (
                <p className="text-xs mt-1 text-right">
                    {msg.is_read ? "✓✓ Seen" : "✓ Sent"}
                </p>
            )}

        </div>
        <div ref={bottomRef}></div>

            </div>
            

                  ))
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    No Messages Yet
                  </div>
                )}

              </div>

              {/* Input Section */}
              <div className="border-t border-gray-800 bg-gray-900 p-4 flex-shrink-0">

                <form className="flex gap-3" onSubmit={handleMessageSend}>

                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={(e) => {

            setMessageText(e.target.value);

            if(socket){

                socket.send(
                    JSON.stringify({
                        type:"typing",
                        chat_id:selectedChat.chat_id
                    })
                );

            }

        }}
                    className="
                      flex-1
                      bg-gray-800
                      border
                      border-gray-700
                      rounded-xl
                      px-4
                      py-3
                      text-white
                      placeholder-gray-500
                      focus:outline-none
                      focus:ring-2
                      focus:ring-blue-500
                    "
                  />

                  <button
                    type="submit"
                    className="
                      bg-blue-600
                      hover:bg-blue-700
                      px-6
                      py-3
                      rounded-xl
                      text-white
                      font-medium
                      transition
                    "
                  >
                    Send
                  </button>

                </form>

              </div>
            </>
          )}

        </div>

          ) : (

            <div className="flex-1 flex items-center justify-center">

              <div className="text-center">

                <div className="w-28 h-28 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-6">
                  <span className="text-5xl">💬</span>
                </div>

                <h1 className="text-3xl font-bold text-white mb-3">
                  Welcome Back
                </h1>

                <p className="text-gray-400 text-lg">
                  Select a chat to start messaging
                </p>

              </div>

            </div>

          )}

        </div>

              </div>

            </div>
          );
}