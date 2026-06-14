import { Search, UserPlus } from "lucide-react";
import { getAllUsers, SendUserFriendRequest } from "../components/getServices";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


export const FindUsers = () => {

    const [users,setUsers] = useState([])

    const navigate = useNavigate()

    const[searchUser,setSearchUser] = useState("")

    const getUsers = async() => {
        try {
            const token = localStorage.getItem("jwt");
            const res = await getAllUsers(token);
            if(res.status>=200 && res.status<300){
                setUsers(res.data);
            }else{
                navigate("/login")
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(()=>{
        getUsers();
    },[])

    const sendUserRequest = async(id) => {
        try {
            const token = localStorage.getItem("jwt");
            const res = await SendUserFriendRequest({receiver_id:id},token);
            

            if(res.status>=200 && res.status<300){
                const newdata = users.filter((curr)=>{
                    return curr.user_id!=id;
                })

                setUsers(newdata);
            }else{
                navigate("/login")
            }

        } catch (error) {
            console.log(error);
        }
    }

    const SearchMyUsers = users.filter((curr)=>curr.username.toLowerCase().includes(searchUser.toLowerCase()))

    return (
        <div className="min-h-screen bg-gray-950">

            {/* Header */}
             <div className="h-20 border-b border-gray-800 bg-gray-900 flex items-center justify-between px-6">

                <div>
                    <h1 className="text-2xl font-bold text-white">
                        Friend Users
                    </h1>

                    <p className="text-gray-400 text-sm">
                        Connect with more people
                    </p>
                </div>

                <button
                    onClick={() => navigate("/chats")}
                    className="
                        bg-gray-800
                        hover:bg-gray-700
                        text-white
                        px-4
                        py-2
                        rounded-lg
                        transition
                    "
                >
                    Back
                </button>

            </div>

            <div className="max-w-5xl mx-auto p-6">

                {/* Search Bar */}

                <div className="relative mb-8">

                    <Search
                        size={20}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                    />

                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchUser}
                        onChange={(e)=>setSearchUser(e.target.value)}
                        className="
                            w-full
                            bg-gray-900
                            border
                            border-gray-800
                            rounded-xl
                            pl-12
                            pr-4
                            py-4
                            text-white
                            placeholder-gray-500
                            focus:outline-none
                            focus:ring-2
                            focus:ring-blue-500
                        "
                    />

                </div>

                {/* Users List */}

                <div className="space-y-4">

                    {users.length > 0 ? (

                        SearchMyUsers.map((user) => (

                            <div
                                key={user.user_id}
                                className="
                                    bg-gray-900
                                    border
                                    border-gray-800
                                    rounded-2xl
                                    p-5
                                    flex
                                    items-center
                                    justify-between
                                    hover:border-gray-700
                                    transition
                                "
                            >

                                <div className="flex items-center gap-4">

                                    <div
                                        className="
                                            w-14
                                            h-14
                                            rounded-full
                                            bg-blue-600
                                            flex
                                            items-center
                                            justify-center
                                            text-white
                                            font-bold
                                            text-lg
                                        "
                                    >
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>

                                    <div>

                                        <h2 className="text-white font-semibold text-lg">
                                            {user.username}
                                        </h2>

                                        <p className="text-gray-400 text-sm">
                                            Available to connect
                                        </p>

                                    </div>

                                </div>

                                <button
                                onClick={()=>sendUserRequest(user.user_id)}
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                        bg-blue-600
                                        hover:bg-blue-700
                                        px-5
                                        py-3
                                        rounded-xl
                                        text-white
                                        font-medium
                                        transition
                                    "
                                >

                                    <UserPlus size={18} />

                                    Send Request

                                </button>

                            </div>

                        ))

                    ) : (

                        <div
                            className="
                                bg-gray-900
                                border
                                border-gray-800
                                rounded-2xl
                                p-16
                                text-center
                            "
                        >

                            <div className="text-6xl mb-4">
                                🔍
                            </div>

                            <h2 className="text-2xl font-bold text-white mb-2">
                                No Users Found
                            </h2>

                            <p className="text-gray-400">
                                Everyone is already connected with you.
                            </p>

                        </div>

                    )}

                </div>

            </div>

        </div>
    );
};

