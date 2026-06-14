import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { acceptFreindRequest, getFreindRequests, rejectFreindRequest } from "../components/getServices";

export const Requests = () => {

    const navigate = useNavigate();

    const [requests, setRequests] = useState([]);

    const handleAccept = async(id) => {
        try {
            const token = localStorage.getItem("jwt")
            const res = await acceptFreindRequest({request_id:id},token);

            if(res.status>=200 && res.status<300){
                const newdata = requests.filter((curr)=>{
                    return curr.request_id!=id
                })
                setRequests(newdata)
            }else{
                navigate("/login")
            }
        } catch (error) {
            console.log(error)
        }
    };

    const handleReject = async(id) => {

        try {
            const token = await localStorage.getItem("jwt");
            const res = await rejectFreindRequest({request_id:id},token);

            if(res.status>=200 && res.status<300){
                const newdata = requests.filter((curr)=>{
                    return curr.request_id!=id
                })
                setRequests(newdata)
            }
        } catch (error) {
            console.log(error)
        }
    };

    const getUserRequests = async() => {
        try {
            const token = localStorage.getItem("jwt");
            const res = await getFreindRequests(token);
            if(res.status>=200 && res.status<300){
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

    return (
        <div className="min-h-screen bg-gray-950">

            {/* Header */}
            <div className="h-20 border-b border-gray-800 bg-gray-900 flex items-center justify-between px-6">

                <div>
                    <h1 className="text-2xl font-bold text-white">
                        Friend Requests
                    </h1>

                    <p className="text-gray-400 text-sm">
                        Manage incoming requests
                    </p>
                </div>

                <button
                    onClick={() => navigate("/")}
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

            {/* Requests List */}
            <div className="max-w-3xl mx-auto p-6">

                {requests.length > 0 ? (

                    <div className="space-y-4">

                        {requests.map((req) => (

                            <div
                                key={req.request_id}
                                className="
                                    bg-gray-900
                                    border
                                    border-gray-800
                                    rounded-2xl
                                    p-5
                                    flex
                                    items-center
                                    justify-between
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
                                        {req.username.charAt(0).toUpperCase()}
                                    </div>

                                    <div>

                                        <h2 className="text-white font-semibold text-lg">
                                            {req.username}
                                        </h2>

                                        <p className="text-gray-400 text-sm">
                                            Sent you a friend request
                                        </p>

                                    </div>

                                </div>

                                <div className="flex gap-3">

                                    <button
                                        onClick={() =>
                                            handleAccept(req.request_id)
                                        }
                                        className="
                                            bg-green-600
                                            hover:bg-green-700
                                            text-white
                                            px-5
                                            py-2
                                            rounded-xl
                                            transition
                                        "
                                    >
                                        Accept
                                    </button>

                                    <button
                                        onClick={() =>
                                            handleReject(req.request_id)
                                        }
                                        className="
                                            bg-red-600
                                            hover:bg-red-700
                                            text-white
                                            px-5
                                            py-2
                                            rounded-xl
                                            transition
                                        "
                                    >
                                        Reject
                                    </button>

                                </div>

                            </div>

                        ))}

                    </div>

                ) : (

                    <div className="flex flex-col items-center justify-center mt-32">

                        <div
                            className="
                                w-24
                                h-24
                                rounded-full
                                bg-gray-800
                                flex
                                items-center
                                justify-center
                                text-4xl
                                mb-5
                            "
                        >
                            👥
                        </div>

                        <h2 className="text-white text-2xl font-bold mb-2">
                            No Requests
                        </h2>

                        <p className="text-gray-400">
                            You don't have any pending friend requests.
                        </p>

                    </div>

                )}

            </div>

        </div>
    );
};