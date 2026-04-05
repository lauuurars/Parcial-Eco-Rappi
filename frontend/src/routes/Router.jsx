import { createBrowserRouter, Navigate } from "react-router-dom";

import PublicLayout from "../layouts/PublicLayout.jsx";
import Login from "../../modules/auth/pages/Login.jsx";
import SignUp from "../../modules/auth/pages/SignUp.jsx";
import PrivateLayout from "../layouts/PrivateLayout.jsx";
import PrivateRoute from "./PrivateRoute.jsx";
import Home from "../../modules/consumer/Pages/Home.jsx";
import StoreDetail from "../../modules/consumer/Pages/StoreDetail.jsx";
import MakeOrder from "../../modules/consumer/Pages/MakeOrder.jsx";
import MyOrders from "../../modules/consumer/Pages/MyOrders.jsx";
import RedirectByRole from "./RedirectByRole.jsx";
import Dashboard from "../../modules/stores/pages/Dashboard.jsx";
import StoreOrders from "../../modules/stores/pages/StoreOrders.jsx";
import DeliveryHome from "../../modules/delivery/pages/DeliveryHome.jsx";
import DeliveryOrderDetail from "../../modules/delivery/pages/DeliveryOrderDetail.jsx";
import DeliveryAcceptedOrders from "../../modules/delivery/pages/DeliveryAcceptedOrders.jsx";

const router = createBrowserRouter(
    [
        {
            path: "/",
            Component: PublicLayout,
            children: [
                {
                    path: "login",
                    Component: Login,
                },
                {
                    path: "sign-up",
                    Component: SignUp,
                },
            ],
        },
        {
            path: "/rappi-app",
            Component: PrivateLayout,
            children: [
                {
                    index: true,
                    element: <RedirectByRole />,
                },
                {
                    path: "consumer",
                    element: (
                        <PrivateRoute allowedRoles={["consumer"]}>
                            <Home />
                        </PrivateRoute>
                    ),
                },
                {
                    path: "consumer/stores/:storeId",
                    element: (
                        <PrivateRoute allowedRoles={["consumer"]}>
                            <StoreDetail />
                        </PrivateRoute>
                    ),
                },
                {
                    path: "consumer/makeorder",
                    element: (
                        <PrivateRoute allowedRoles={["consumer"]}>
                            <MakeOrder />
                        </PrivateRoute>
                    ),
                },
                {
                    path: "consumer/orders",
                    element: (
                        <PrivateRoute allowedRoles={["consumer"]}>
                            <MyOrders />
                        </PrivateRoute>
                    ),
                },
                {
                    path: "stores",
                    element: (
                        <PrivateRoute allowedRoles={["store", "store_admin"]}>
                            <Dashboard />
                        </PrivateRoute>
                    ),
                },
                {
                    path: "stores/orders",
                    element: (
                        <PrivateRoute allowedRoles={["store", "store_admin"]}>
                            <StoreOrders />
                        </PrivateRoute>
                    ),
                },
                {
                    path: "delivery",
                    element: (
                        <PrivateRoute allowedRoles={["delivery"]}>
                            <DeliveryHome />
                        </PrivateRoute>
                    ),
                },
                {
                    path: "delivery/orders/:orderId",
                    element: (
                        <PrivateRoute allowedRoles={["delivery"]}>
                            <DeliveryOrderDetail />
                        </PrivateRoute>
                    ),
                },
                {
                    path: "delivery/accepted",
                    element: (
                        <PrivateRoute allowedRoles={["delivery"]}>
                            <DeliveryAcceptedOrders />
                        </PrivateRoute>
                    ),
                },
            ],
        },

        { path: "*", element: <Navigate to="/" replace /> },
    ],
    { basename: "/rappi" },
);

export default router;
