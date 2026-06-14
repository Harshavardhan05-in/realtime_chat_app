import {
  ArrowLeft,
  Edit,
  Mail,
  Calendar
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import { getProfile } from "../components/getServices";
import { useEffect, useState } from "react";


export const Profile = () => {

  const navigate = useNavigate();

  const[mydetils,setMydeatils] = useState({})

  const getUserDatils = async() => {
    try {
        const token =  localStorage.getItem("jwt");
        const res = await getProfile(token);
        console.log(res)
        if(res.status>=200 && res.status<300){
            setMydeatils(res.data)
        }
    } catch (error) {
        console.log(error);
    }   
  }

  useEffect(()=>{
    getUserDatils()
  },[])

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
            max-w-4xl
            mx-auto
            px-4
            py-4
          "
        >

          <div className="flex items-center gap-3">

            <button
              onClick={() => navigate("/")}
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
              My Profile
            </h1>

          </div>

        </div>
      </div>

      {/* Content */}

      <div
        className="
          max-w-4xl
          mx-auto
          px-4
          py-8
        "
      >

        {/* Profile Card */}

        <div
          className="
            bg-gray-900
            border
            border-gray-800
            rounded-3xl
            p-6
            sm:p-10
            shadow-xl
          "
        >

          {/* Top Section */}

          <div
            className="
              flex
              flex-col
              items-center
              text-center
            "
          >

            <img
              src={mydetils.profile_photo_url}
              alt="profile"
              className="
                w-32
                h-32
                sm:w-40
                sm:h-40
                rounded-full
                object-cover
                border-4
                border-indigo-500
                shadow-lg
              "
            />

            <h2
              className="
                text-2xl
                sm:text-3xl
                font-bold
                text-white
                mt-5
              "
            >
              {mydetils?.username}
            </h2>

            <p
              className="
                text-gray-400
                mt-2
              "
            >
              HV USER!
            </p>

          </div>

          {/* Divider */}

          <div
            className="
              h-px
              bg-gray-800
              my-8
            "
          />

          {/* Information Section */}

          <div className="space-y-5">

            {/* Username */}

            <div
              className="
                bg-gray-950
                border
                border-gray-800
                rounded-2xl
                p-4
              "
            >

              <p
                className="
                  text-gray-500
                  text-sm
                  mb-1
                "
              >
                Username
              </p>

              <p
                className="
                  text-white
                  font-medium
                "
              >
                {mydetils?.username}

              </p>

            </div>

            {/* Email */}

            <div
              className="
                bg-gray-950
                border
                border-gray-800
                rounded-2xl
                p-4
                flex
                items-center
                gap-3
              "
            >

              <Mail
                size={18}
                className="text-indigo-400"
              />

              <div>

                <p
                  className="
                    text-gray-500
                    text-sm
                  "
                >
                  Email
                </p>

                <p className="text-white">
                  {mydetils?.email}
                </p>

              </div>

            </div>

            {/* Joined Date */}

            <div
              className="
                bg-gray-950
                border
                border-gray-800
                rounded-2xl
                p-4
                flex
                items-center
                gap-3
              "
            >

              <Calendar
                size={18}
                className="text-indigo-400"
              />

              <div>

                <p
                  className="
                    text-gray-500
                    text-sm
                  "
                >
                  Joined On
                </p>

                <p className="text-white">
                  {mydetils?.registered_at}
                </p>

              </div>

            </div>

          </div>

          {/* Button */}
            
          <div className="mt-8">
            <NavLink to="/editprofile">

                    <button
                    className="
                        w-full
                        bg-indigo-600
                        hover:bg-indigo-700
                        text-white
                        py-3
                        rounded-2xl
                        font-semibold
                        transition
                        flex
                        items-center
                        justify-center
                        gap-2
                    ">

                    <Edit size={18} />

                    Edit Details

                </button>
            </NavLink>
            

          </div>

        </div>

      </div>

    </div>
  );
};