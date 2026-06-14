import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  Image as ImageIcon,
  Save,
  X
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { getProfile, updateProfilePhoto, updateUserProfile } from "../components/getServices";
import { useEffect, useState } from "react";

export const EditProfile = () => {

  const navigate = useNavigate();
  const[inputValue,setInputValue] = useState({
    username:"",
    email:"",
    profile_photo_url:"",
    password:"",
    cpassword:"",
  })

  const[imagePreviwe,setImagePreview] = useState("")

  const getUserDetails = async() => {
    try {
        const token = localStorage.getItem("jwt");
        const res = await getProfile(token);
        console.log(res)
        if(res.status>=200 && res.status<300){
            setInputValue((prev)=>({...prev,username:res.data.username||"",email:res.data.email||"",profile_photo_url:res.data.profile_photo_url||""}));
        }
    } catch (error) {
        console.log(error);
    }
  } 

  useEffect(()=>{
    getUserDetails();
  },[])

  const handleInputChnage = (e) => {

    const { name, value, files } = e.target;

    if(name === "profile_photo_url"){

        setInputValue({
            ...inputValue,
            profile_photo_url: files[0]
        });
        setImagePreview(
            URL.createObjectURL(files[0])
        );

    }
    else{

        setInputValue({
            ...inputValue,
            [name]: value
        });

    }

}

const updateProfile = (data,token) => {
    try {
        return updateUserProfile(data,token);
    
    } catch (error) {
        console.log(error);
    }
}

const uploadImage = async() => {

    try{

        if(
            !inputValue.profile_photo_url ||
            typeof inputValue.profile_photo_url === "string"
        ){
            return inputValue.profile_photo_url;
        }

        const formData = new FormData();

        formData.append(
            "file",
            inputValue.profile_photo_url
        );

        const res =
            await updateProfilePhoto(
                formData
            );
            
        return res.data.image_url;

    }
    catch(error){

        console.log(error);

        return null;

    }

}

  const handleEditData = async() => {

    try{

        if(
            inputValue.password !==
            inputValue.cpassword
        ){

            alert(
                "Passwords Do Not Match"
            );

            return;

        }

        const imageUrl =
            await uploadImage();

        const token =
            localStorage.getItem("jwt");

        const payload = {

            username:
                inputValue.username,

            email:
                inputValue.email,

            profile_photo_url:
                imageUrl,

            password:
                inputValue.password

        };

        const res =
            await updateProfile(
                payload,
                token
            );

        if(
            res.status >= 200 &&
            res.status < 300
        ){

            alert(
                "Profile Updated Successfully"
            );

            navigate("/profile");

        }

    }
    catch(error){

        console.log(error);

    }

}

  return (
    <div className="min-h-screen bg-gray-950">

      {/* Header */}

      <div
        className="
          sticky
          top-0
          z-50
          bg-gray-900/95
          backdrop-blur
          border-b
          border-gray-800
        "
      >

        <div
          className="
            max-w-3xl
            mx-auto
            px-4
            py-4
          "
        >

          <div className="flex items-center gap-3">

            <button
              onClick={() => navigate("/profile")}
              className="
                p-2
                rounded-lg
                hover:bg-gray-800
                transition
              "
            >

              <ArrowLeft
                size={22}
                className="text-white"
              />

            </button>

            <h1
              className="
                text-xl
                sm:text-2xl
                font-bold
                text-white
              "
            >
              Edit Profile
            </h1>

          </div>

        </div>

      </div>

      {/* Content */}

      <div
        className="
          max-w-3xl
          mx-auto
          px-4
          py-8
        "
      >

        <div
          className="
            bg-gray-900
            border
            border-gray-800
            rounded-3xl
            p-5
            sm:p-8
            shadow-xl
          "
        >

          {/* Profile Preview */}

          <div
            className="
              flex
              flex-col
              items-center
              mb-8
            "
          >

            <img
              src={
                    imagePreviwe ||
                    inputValue.profile_photo_url ||
                    "https://i.pravatar.cc/300"
                }
              alt="profile"
              className="
                w-28
                h-28
                sm:w-36
                sm:h-36
                rounded-full
                object-cover
                border-4
                border-indigo-500
                shadow-lg
              "
            />

            <p
              className="
                text-gray-400
                text-sm
                mt-3
              "
            >
              Profile Preview
            </p>

          </div>

          {/* Form */}

          <div className="space-y-5">

            {/* Profile Photo URL */}

                        <div>

                        <label
                            className="
                            text-gray-300
                            text-sm
                            mb-2
                            block
                            "
                        >
                            Profile Photo
                        </label>

                        <label
                            className="
                            flex
                            items-center
                            justify-center
                            gap-3

                            w-full
                            h-32

                            bg-gray-950
                            border-2
                            border-dashed
                            border-gray-700

                            rounded-2xl

                            cursor-pointer

                            hover:border-indigo-500
                            transition
                            "
                        >

                            <ImageIcon
                            size={24}
                            className="text-indigo-400"
                            />

                            <span className="text-gray-400">
                            Click to Upload Image
                            </span>

                            <input
                            type="file"
                            accept="image/*"
                            name="profile_photo_url"
                            onChange={(e)=>handleInputChnage(e)}
                            className="hidden"
                            />

                        </label>

                        </div>

            {/* Username */}

            <div>

              <label
                className="
                  text-gray-300
                  text-sm
                  mb-2
                  block
                "
              >
                Username
              </label>

              <div className="relative">

                <User
                  size={18}
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-gray-500
                  "
                />

                <input
                  type="text"
                  placeholder="Enter username..."
                  value={inputValue.username}
                  name="username"
                  onChange={(e)=>handleInputChnage(e)}
                  className="
                    w-full
                    bg-gray-950
                    border
                    border-gray-800
                    rounded-xl
                    py-3
                    pl-11
                    pr-4
                    text-white
                    outline-none
                    focus:border-indigo-500
                  "
                />

              </div>

            </div>

            {/* Email */}

            <div>

              <label
                className="
                  text-gray-300
                  text-sm
                  mb-2
                  block
                "
              >
                Email
              </label>

              <div className="relative">

                <Mail
                  size={18}
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-gray-500
                  "
                />

                <input
                  type="email"
                  placeholder="Enter email..."
                  name="email"
                  value={inputValue.email}
                  onChange={(e)=>handleInputChnage(e)}
                  className="
                    w-full
                    bg-gray-950
                    border
                    border-gray-800
                    rounded-xl
                    py-3
                    pl-11
                    pr-4
                    text-white
                    outline-none
                    focus:border-indigo-500
                  "
                />

              </div>

            </div>

            {/* Password */}

            <div>

              <label
                className="
                  text-gray-300
                  text-sm
                  mb-2
                  block
                "
              >
                New Password
              </label>

              <div className="relative">

                <Lock
                  size={18}
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-gray-500
                  "
                />

                <input
                  type="password"
                  placeholder="Leave empty if not changing"
                  name="password"
                  value={inputValue.password}
                  onChange={(e)=>handleInputChnage(e)}
                  className="
                    w-full
                    bg-gray-950
                    border
                    border-gray-800
                    rounded-xl
                    py-3
                    pl-11
                    pr-4
                    text-white
                    outline-none
                    focus:border-indigo-500
                  "
                />

              </div>

            </div>

            {/* Confirm Password */}

            <div>

              <label
                className="
                  text-gray-300
                  text-sm
                  mb-2
                  block
                "
              >
                Confirm Password
              </label>

              <div className="relative">

                <Lock
                  size={18}
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-gray-500
                  "
                />

                <input
                  type="password"
                  placeholder="Confirm new password"
                  name="cpassword"
                  value={inputValue.cpassword}
                  onChange={(e)=>handleInputChnage(e)}
                  className="
                    w-full
                    bg-gray-950
                    border
                    border-gray-800
                    rounded-xl
                    py-3
                    pl-11
                    pr-4
                    text-white
                    outline-none
                    focus:border-indigo-500
                  "
                />

              </div>

            </div>

          </div>

          {/* Buttons */}

          <div
            className="
              flex
              flex-col
              sm:flex-row
              gap-3
              mt-8
            "
          >

            <button
                onClick={()=>navigate("/profile")}
              className="
                flex-1
                bg-gray-800
                hover:bg-gray-700
                text-white
                py-3
                rounded-xl
                font-medium
                flex
                items-center
                justify-center
                gap-2
                transition
              "
            >

              <X size={18} />

              Cancel

            </button>

            <button
                onClick={handleEditData}
              className="
                flex-1
                bg-indigo-600
                hover:bg-indigo-700
                text-white
                py-3
                rounded-xl
                font-medium
                flex
                items-center
                justify-center
                gap-2
                transition
              "
            >

              <Save size={18} />

              Save Changes

            </button>

          </div>

        </div>

      </div>

    </div>
  );
};