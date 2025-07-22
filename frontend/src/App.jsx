import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "./App.css";
import Header from "./components/Header";
import Home from "./Pages/Home";
import ProductListing from "./Pages/ProductListing";
import Footer from "./components/Footer";
import ProductDetails from "./Pages/ProductDetails";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import AboutUs from "./Pages/AboutUs";
import BusinessPartnerLogin from "./Pages/BusinessPartner/BusinessPartner.jsx";
import ContactUs from "./Pages/ContactUs";
import Cart from "./Pages/Cart";
import WhatsAppWidget from "./components/WhatsAppWidget/WhatsAppWidget.jsx"; // Import WhatsAppWidget
import MobileAccountPage from "./Pages/MobileAccountPage/MobileAccountPage.jsx";
import BusinessPartnerSignup from "./Pages/BusinessPartner/BusinessPartnerSignup.jsx"; // Import MobileAccountPage
import SubCategoryPage from './Pages/SubCategoryPage/SubCategoryPage.jsx'

import CustomPrinting from "./Pages/CustomPrinting/index.jsx";

import Account from "./Pages/Account";
import Wishlist from "./Pages/Wishlist";
import ResetPassword from "./Pages/ResetPassword";
import EnquiryHistory from "./Pages/EnquiryHistory"; // Add EnquiryHistory import
import ComingSoon from "./Pages/ComingSoon"; // Add ComingSoon import
import PrivacyPolicy from "./Pages/PrivacyPolicy";
import TermsOfService from "./Pages/TermsOfService";
import FAQ from "./Pages/FAQ";
import ShippingReturns from "./Pages/ShippingReturns";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./contexts/AuthContext";
import { SettingsProvider } from "./contexts/SettingsContext.jsx";
import { PromotionalProvider } from "./contexts/PromotionalContext.jsx";
import DynamicHead from "./components/DynamicHead";
import AnnouncementBar from "./components/AnnouncementBar";
import CategoriesBar from "./components/CategoriesBar";
import { LocationProvider } from "./contexts/LocationContext.jsx";
import LocationModal from "./components/LocationModal/LocationModal.jsx";

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <>
      <AuthProvider>
        <LocationProvider>
        <SettingsProvider>
          <PromotionalProvider>
            <DynamicHead />
            <BrowserRouter>
              <AnnouncementBar />
              <Header />
              <LocationModal/>
              <CategoriesBar />
              <Routes>
                <Route path={"/"} exact={true} element={<Home />} />
                <Route
                  path={"/productListing"}
                  exact={true}
                  element={<ProductListing />}
                />
                <Route
                  path={"/product/:id"}
                  exact={true}
                  element={<ProductDetails />}
                />
                <Route path={"/login"} exact={true} element={<Login />} />
                <Route path={"/signup"} exact={true} element={<Signup />} />
                <Route
                  path={"/reset-password"}
                  exact={true}
                  element={<ResetPassword />}
                />
                <Route path={"/about-us"} exact={true} element={<AboutUs />} />
                <Route
                  path={"/contact-us"}
                  exact={true}
                  element={<ContactUs />}
                />
                <Route path={"/cart"} exact={true} element={<Cart />} />
                <Route
                  path={"/custom-printing"}
                  exact={true}
                  element={<CustomPrinting />}
                />
                <Route
                  path={"/privacy-policy"}
                  exact={true}
                  element={<PrivacyPolicy />}
                />
                <Route
                  path={"/terms-of-service"}
                  exact={true}
                  element={<TermsOfService />}
                />
                <Route path={"/faq"} exact={true} element={<FAQ />} />
                <Route
                  path={"/BusinessPartner"}
                  exact={true}
                  element={<BusinessPartnerLogin />}
                />
                <Route
                  path={"/BusinessPartnerSignup"}
                  exact={true}
                  element={<BusinessPartnerSignup />}
                />
                <Route
                  path="/subcategories/:categoryName"
                  element={<SubCategoryPage />}
                />
                <Route
                  path={"/shipping-returns"}
                  exact={true}
                  element={<ShippingReturns />}
                />
                <Route
                  path={"/account"}
                  exact={true}
                  element={
                    <ProtectedRoute>
                      <Account />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={"/MobileAccount"}
                  exact={true}
                  element={
                    <ProtectedRoute>
                      <MobileAccountPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={"/wishlist"}
                  exact={true}
                  element={
                    <ProtectedRoute>
                      <Wishlist />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={"/enquiry-history"}
                  exact={true}
                  element={
                    <ProtectedRoute>
                      <EnquiryHistory />
                    </ProtectedRoute>
                  }
                />{" "}
                {/* Add protected route for EnquiryHistory */}
                <Route
                  path={"/coming-soon"}
                  exact={true}
                  element={<ComingSoon />}
                />{" "}
                {/* Add route for ComingSoon */}
                {/* Fallback 404 route */}
                <Route
                  path="*"
                  element={
                    <div style={{ padding: 40, textAlign: "center" }}>
                      <h2>404 - Page Not Found</h2>
                    </div>
                  }
                />
              </Routes>
              <WhatsAppWidget />
              <Footer />
            </BrowserRouter>
          </PromotionalProvider>
        </SettingsProvider>
        </LocationProvider>
      </AuthProvider>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default App;
