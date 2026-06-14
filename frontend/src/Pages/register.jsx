import { useState } from "react";
import { postData } from "../components/getServices";
import { NavLink, useNavigate } from "react-router-dom";


export const Register = () => {

    const navigate = useNavigate()

    const [inputValue,setInputValue] = useState({
        username:"",
        email:"",
        password:""
    })

    const handleInputChange = (e) => {
        const{name,value} = e.target;

        setInputValue((prev)=>({...prev,[name]:value}))
    }

    const postuserData = async() => {
        try {
            const res =  await postData(inputValue);
            if(res.status >= 200 && res.status < 300){
                navigate("/login")
            }else{
                setInputValue({
                    "username":"",
                    "email":"",
                    "password":""
                })
            }
        } catch (error) {
            console.log(error)
            setInputValue({
                    "username":"",
                    "email":"",
                    "password":""
                })
        }
    }

    const hanldeFormSubmit = (e) => {
        e.preventDefault()
        postuserData()
    }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 px-4 sm:px-6 lg:px-8">

      <div className="w-full max-w-md backdrop-blur-md bg-white/90 rounded-3xl shadow-2xl p-6 sm:p-8">

        <div className="text-center mb-8">

          <div className="w-16 h-16 mx-auto bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
            HV
          </div>

          <h1 className="text-3xl font-bold text-gray-800">
            Create Account
          </h1>

          <p className="text-gray-500 mt-2">
            Join and start chatting instantly
          </p>

        </div>

        <form className="space-y-5" onSubmit={hanldeFormSubmit}>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>

            <input
              type="text"
              placeholder="Enter username"
              value={inputValue.username}
              name="username"
              onChange={(e)=>handleInputChange(e)}
              className="
                w-full
                px-4
                py-3
                rounded-xl
                border
                border-gray-300
                bg-gray-50
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
                focus:border-blue-500
                transition
              "
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>

            <input
              type="email"
              placeholder="Enter email"
              name="email"
              value={inputValue.email}
              onChange={(e)=>handleInputChange(e)}

              className="
                w-full
                px-4
                py-3
                rounded-xl
                border
                border-gray-300
                bg-gray-50
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
                focus:border-blue-500
                transition
              "
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter password"
              name="password"
              value={inputValue.password}
              onChange={(e)=>handleInputChange(e)}

              className="
                w-full
                px-4
                py-3
                rounded-xl
                border
                border-gray-300
                bg-gray-50
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
                focus:border-blue-500
                transition
              "
            />
          </div>

          <button
            type="submit"
            className="
              w-full
              py-3
              rounded-xl
              bg-blue-600
              text-white
              font-semibold
              hover:bg-blue-700
              hover:scale-[1.02]
              transition
              duration-300
              shadow-lg
            "
          >
            Create Account
          </button>

        </form>

        <div className="mt-6 text-center">
    
          <p className="text-gray-600">
            Already have an account?{" "}
            <NavLink to="/login">
                   <span className="text-blue-600 font-medium cursor-pointer hover:underline">
              Login
            </span>
            </NavLink>
           
          </p>
        </div>

      </div>

    </div>
  );
}