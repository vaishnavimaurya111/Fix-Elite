import { createBrowserRouter } from "react-router";
import Root from "./Root";
import Home from "./pages/Home";
import ServiceSelection from "./pages/ServiceSelection";
import ProblemDescription from "./pages/ProblemDescription";
import WorkerSelection from "./pages/WorkerSelection";
import Tracking from "./pages/Tracking";
import Invoice from "./pages/Invoice";
import BookingHistory from "./pages/BookingHistory";
import Login from "./pages/Login";
import ProviderDashboard from "./pages/ProviderDashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "login", Component: Login },
      { path: "services", Component: ServiceSelection },
      { path: "describe-problem", Component: ProblemDescription },
      { path: "select-worker", Component: WorkerSelection },
      { path: "tracking/:bookingId", Component: Tracking },
      { path: "invoice/:bookingId", Component: Invoice },
      { path: "bookings", Component: BookingHistory },
      { path: "provider-dashboard", Component: ProviderDashboard },
    ],
  },
]);