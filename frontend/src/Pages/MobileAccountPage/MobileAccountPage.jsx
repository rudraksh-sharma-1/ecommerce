import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

function MobileAccountPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        navigate("/"); // Redirect to home when screen is desktop size
      }
    };

    // Initial check in case user opens directly on desktop
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [navigate]);

  return (
    <div className="md:hidden max-w-sm mx-auto p-4 pt-0 space-y-4">
      <div className="text-sm text-gray-600 mb-2">
        <span>Profile</span>
        <span className="mx-2">{">"}</span>
        <span className="text-indigo-600 font-medium">My Account</span>
      </div>

      {/* Each link as a wide vertical button */}
      <Link
        to="/account"
        className="block w-full text-center bg-white rounded-lg py-3 px-4 shadow text-gray-800 font-medium hover:bg-indigo-50 transition"
      >
        Profile
      </Link>

      <Link
        to="/coming-soon?feature=orders"
        className="!ml-0 block w-full text-center bg-white rounded-lg py-3 px-4 shadow text-gray-800 font-medium hover:bg-indigo-50 transition"
      >
        My Orders
      </Link>

      <Link
        to="/coming-soon?feature=wallet"
        className="!ml-0 block w-full text-center bg-white rounded-lg py-3 px-4 shadow text-gray-800 font-medium hover:bg-indigo-50 transition"
      >
        Wallet
      </Link>

      <Link
        to="/enquiry-history"
        className="!ml-0 block w-full text-center bg-white rounded-lg py-3 px-4 shadow text-gray-800 font-medium hover:bg-indigo-50 transition"
      >
        Enquiries
      </Link>

      <Link
        to="/contact-us"
        className="!ml-0 block w-full text-center bg-white rounded-lg py-3 px-4 shadow text-gray-800 font-medium hover:bg-indigo-50 transition"
      >
        Contact Us
      </Link>

      <Link
        to="/cart"
        className="!ml-0 block w-full text-center bg-white rounded-lg py-3 px-4 shadow text-gray-800 font-medium hover:bg-indigo-50 transition"
      >
        Cart
      </Link>

      <hr className="border-gray-400" />

      <button
        onClick={async () => {
          await logout();
          navigate("/");
        }}
        className="block w-full text-center bg-red-500 text-white font-medium rounded-lg py-3 px-4 hover:bg-red-600 transition"
      >
        Logout
      </button>
    </div>
  );
}

export default MobileAccountPage;
