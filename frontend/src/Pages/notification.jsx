import {
    Bell,
    ArrowLeft,
    UserPlus,
    CheckCircle
} from "lucide-react";
import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import {getAllNotification} from "../components/getServices";

export const Notifications = () => {

    const[notifications,setNotifications] = useState([])

    const navigate = useNavigate();

    const getMyNotifications = async() => {
        try {
            const token = localStorage.getItem("jwt");
            const res = await getAllNotification(token);

            if(res.status>=200 && res.status<300){
                setNotifications(res.data);
            }

        } catch (error) {
            console.log(error);
        }
    }

    useEffect(()=>{
        getMyNotifications()
    },[])

    const getIcon = (notification) => {

        const iconColor = notification.is_read
            ? "text-white"
            : "text-blue-500";

        if (
            notification.type ===
            "friend_request"
        ) {
            return (
                <UserPlus
                    size={22}
                    className={iconColor}
                />
            );
        }

        return (
            <CheckCircle
                size={22}
                className={iconColor}
            />
        );
    };


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
                        max-w-5xl
                        mx-auto
                        px-4
                        sm:px-6
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

                        <Bell
                            size={24}
                            className="text-blue-500"
                        />

                        <h1
                            className="
                                text-xl
                                sm:text-2xl
                                font-bold
                                text-white
                            "
                        >
                            Notifications
                        </h1>

                    </div>

                </div>

            </div>

            {/* Content */}

            <div
                className="
                    max-w-5xl
                    mx-auto
                    px-4
                    sm:px-6
                    py-6
                "
            >

                {notifications.length > 0 ? (

                    <div className="space-y-4">

                       {notifications.map((n) => (

                                <div
                                    key={n.notification_id}
                                    className={`
                                        relative
                                        rounded-2xl
                                        border
                                        p-4
                                        sm:p-5
                                        transition
                                        hover:scale-[1.01]
                                        cursor-pointer

                                        ${
                                            n.is_read
                                                ? `
                                                    bg-gray-900
                                                    border-gray-800
                                                    hover:border-gray-700
                                                `
                                                : `
                                                    bg-gray-900
                                                    border-blue-500/50
                                                    shadow-lg
                                                    shadow-blue-500/10
                                                `
                                        }
                                    `}
                                >
                                            <div className="flex gap-4 items-start">

                                        {/* Icon */}

                                        <div
                                            className="
                                                flex-shrink-0
                                                mt-1
                                            "
                                        >
                                            {getIcon(n)}
                                        </div>

                                        {/* Content */}

                                        <div className="flex-1 min-w-0">

                                            <p
                                                className={`
                                                    break-words
                                                    leading-relaxed
                                                    text-sm
                                                    sm:text-base

                                                    ${
                                                        n.is_read
                                                            ? "text-gray-300"
                                                            : "text-white"
                                                    }
                                                `}
                                            >
                                                {n.message}
                                            </p>

                                            <p
                                                className="
                                                    text-xs
                                                    sm:text-sm
                                                    text-gray-500
                                                    mt-2
                                                "
                                            >
                                                {n.created_at}
                                            </p>

                                        </div>

                                        {/* Unread Blue Dot */}

                                        {!n.is_read && (
                                            <div
                                                className="
                                                    w-3
                                                    h-3
                                                    rounded-full
                                                    bg-blue-500
                                                    mt-2
                                                    flex-shrink-0
                                                "
                                            />
                                        )}

                                    </div>


                                                                </div>

                        ))}

                    </div>

                ) : (

                    <div
                        className="
                            flex
                            flex-col
                            items-center
                            justify-center
                            text-center
                            py-24
                        "
                    >

                        <div
                            className="
                                w-24
                                h-24
                                rounded-full
                                bg-gray-900
                                flex
                                items-center
                                justify-center
                                mb-6
                            "
                        >

                            <Bell
                                size={42}
                                className="text-gray-500"
                            />

                        </div>

                        <h2
                            className="
                                text-xl
                                sm:text-2xl
                                font-bold
                                text-white
                                mb-2
                            "
                        >
                            No Notifications Yet
                        </h2>

                        <p
                            className="
                                text-gray-400
                                max-w-sm
                            "
                        >
                            You're all caught up.
                            New notifications will appear here.
                        </p>

                    </div>

                )}

            </div>

        </div>
    );
};

