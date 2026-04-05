import { createBrowserRouter, Navigate } from "react-router-dom";

import PublicLayout from "../layouts/PublicLayout.jsx"
import Login from "../../modules/auth/pages/Login.jsx";
import SignUp from "../../modules/auth/pages/SignUp.jsx";
import PrivateLayout from "../layouts/PrivateLayout.jsx";
import PrivateRoute from "./PrivateRoute.jsx";
import Home from "../../modules/consumer/Pages/Home.jsx";
import RedirectByRole from "./RedirectByRole.jsx";

const router = createBrowserRouter([
    {
        path: "/",
        Component: PublicLayout,
        children: [
            {
                path: "login",
                Component: Login
            },
            {
                path: "sign-up",
                Component: SignUp
            }
        ],
    },
    {
        path: "/rappi-app",
        Component: PrivateLayout,
        children: [
            {
                index: true,
                element: <RedirectByRole /> 
            },
            {
                path: "consumer",
                element: (
                    <PrivateRoute allowedRoles={["consumer"]}>
                        <Home />
                    </PrivateRoute>
                )
            }
        ]
    },

    { path: "*", element: <Navigate to="/" replace /> },
],
    { basename: "/rappi" }
);

export default router;
