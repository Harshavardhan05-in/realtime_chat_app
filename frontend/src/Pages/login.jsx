import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { postUserLoginData } from "../components/getServices";

export const Login = () => {

    const navigate = useNavigate()

    const[inputValue,setInputValue] = useState({
        email:"",
        password:""
    })
    
        const handleInputChange = (e) => {
            const{name,value} = e.target;
    
            setInputValue((prev)=>({...prev,[name]:value}))
        }

        const postLoginData = async() => {
            try {
                const res = await postUserLoginData(inputValue);
                if(res.status >= 200 && res.status < 300){
                    const token = res.data["access_token"];
                    localStorage.setItem("jwt",token)
                    navigate("/")

                }else{
                    setInputValue({
                        email:"",
                        password:""
                    })
                }
                
            } catch (error) {
                console.log(error);
                setInputValue({
                    email:"",
                    password:""
                })
            }
        }

        const hanldeFormSubmit = (e) => {
            e.preventDefault()
            postLoginData();
        }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 px-4">

      <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-6 sm:p-8">

        <div className="text-center mb-8">

          <div className="w-16 h-16 mx-auto bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
            HV
          </div>

          <h1 className="text-3xl font-bold text-gray-800">
            Welcome Back
          </h1>

          <p className="text-gray-500 mt-2">
            Sign in to continue chatting
          </p>

        </div>

        <form className="space-y-5" onSubmit={hanldeFormSubmit}>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>

            <input
              type="email"
              placeholder="Enter your email"
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
              placeholder="Enter your password"
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
              shadow-lg
              hover:bg-blue-700
              hover:scale-[1.02]
              transition-all
              duration-300
            "
          >
            Login
          </button>

        </form>

        <div className="mt-6 text-center">

          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-blue-600 font-medium hover:underline"
            >
              Register
            </Link>
          </p>

        </div>

      </div>

    </div>
  );
}