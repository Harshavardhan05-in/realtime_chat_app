import axios from "axios";

const api = axios.create({
    baseURL:"http://127.0.0.1:8000"
})

export const postData = (data) => {
    return api.post("/register",data)
}

export const postUserLoginData = (data) => {
    return api.post("/login",data)
}

export const getUserChats = (token) => {
    return api.get("/chats",{
        headers: {
          "Authorization": `Bearer ${token}`,  
          "Content-Type": "application/json"
        }
      })
}

export const getMessages = (chat_id,token) => {
    return api.get(`/messages/${chat_id}`,{
        headers: {
          "Authorization": `Bearer ${token}`,  
          "Content-Type": "application/json"
        }
      });
}

export const sendMessage = (data,token) => {
    return api.post("sendmessage",data,{
        headers: {
          "Authorization": `Bearer ${token}`,  
          "Content-Type": "application/json"
        }
      })
}

export const getProfile = (token) => {
  return api.get("/profile",{
    headers:{
      "Authorization":`Bearer ${token}`,
      "Content-Type":"application/json"
    }
  })
}

export const getUserStatus = (id) => {
  return api.get(`/status/${id}`)
}

export const SendUserFriendRequest = (data,token) => {
    return api.post("/sendrequest",data,{
      headers:{
        "Authorization":`Bearer ${token}`,
        "Content-Type":"application/json"
      }
    })
}

export const getFreindRequests = (token) => {
    return api.get("/requests",{
      headers:{
          "Authorization":`Bearer ${token}`,
          "Content-Type":"application/json"
      }
    })
}

export const acceptFreindRequest = (data,token) => {
  return api.post("/acceptrequest",data,{
      headers:{
          "Authorization":`Bearer ${token}`,
          "Content-Type":"application/json"
      }
  })
}

export const rejectFreindRequest = (data,token) => {
  return api.post("/rejectrequest",data,{
      headers:{
          "Authorization":`Bearer ${token}`,
          "Content-Type":"application/json"
      }
  })
}

export const getAllUsers = (token) => {
  return api.get("/findusers",{
    headers:{
        "Authorization":`Bearer ${token}`,
        "Content-Type":"application/json"
    }
  })
}

export const getAllNotification = (token) => {
  return api.get("/notifications",{
    headers:{
        "Authorization":`Bearer ${token}`,
        "Content-Type":"application/json"
    }
  })
}

export const getAllNotificationCount = (token) => {
    return api.get("/notificationcount",{
      headers:{
          "Authorization":`Bearer ${token}`,
        "Content-Type":"application/json"
      }
    })
}

export const updateProfilePhoto = (formdata) =>{
  return api.post("/uploadprofilephoto",formdata,{
    headers:{
                "Content-Type":"multipart/form-data"
            }
  })
}

export const updateUserProfile = (data,token) =>{
  return api.put("/updateprofile",data,{
    headers:{
          "Authorization":`Bearer ${token}`,
        "Content-Type":"application/json"
      }
  })
}