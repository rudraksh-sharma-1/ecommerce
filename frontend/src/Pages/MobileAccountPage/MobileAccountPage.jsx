import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { UserPen, Wallet, ClipboardList, Phone, ShoppingCart, LogOut, List, Package, Heart } from "lucide-react";

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
    <div className="md:hidden max-w-sm mx-auto p-4 pt-15 space-y-4">
      {/* Each link as a wide vertical button */}
      <Link
        to="/account"
        className="flex justify-center w-full text-center bg-white rounded-lg py-3 px-4 shadow text-gray-800 font-medium hover:bg-indigo-50 transition"
      >
        <UserPen  className="pr-2"/>Profile
      </Link>

      <Link
        to="/coming-soon?feature=orders"
        className="!ml-0 flex justify-center w-full text-center bg-white rounded-lg py-3 px-4 shadow text-gray-800 font-medium hover:bg-indigo-50 transition"
      >
        <List className="pr-2"/>Refund 
      </Link>
      <Link
        to="/coming-soon?feature=orders"
        className="!ml-0 flex justify-center w-full text-center bg-white rounded-lg py-3 px-4 shadow text-gray-800 font-medium hover:bg-indigo-50 transition"
      >
        <Package className='pr-2'/>Orders
      </Link>

      <Link
        to="/coming-soon?feature=wallet"
        className="!ml-0 flex justify-center w-full text-center bg-white rounded-lg py-3 px-4 shadow text-gray-800 font-medium hover:bg-indigo-50 transition"
      >
        <Wallet className="pr-2"/>Wallet
      </Link>

      <Link
        to="/wishlist"
        className="!ml-0 flex justify-center w-full text-center bg-white rounded-lg py-3 px-4 shadow text-gray-800 font-medium hover:bg-indigo-50 transition"
      >
        <Heart  className="pr-2"/>Wishlist
      </Link>

      <Link
        to="/enquiry-history"
        className="!ml-0 flex justify-center w-full text-center bg-white rounded-lg py-3 px-4 shadow text-gray-800 font-medium hover:bg-indigo-50 transition"
      >
        <ClipboardList className="pr-2"/>Enquiries
      </Link>

      <Link
        to="/contact-us"
        className="!ml-0 flex justify-center w-full text-center bg-white rounded-lg py-3 px-4 shadow text-gray-800 font-medium hover:bg-indigo-50 transition"
      >
        <Phone className="pr-2"/>Contact Us
      </Link>

      <Link
        to="/cart"
        className="!ml-0 flex justify-center w-full text-center bg-white rounded-lg py-3 px-4 shadow text-gray-800 font-medium hover:bg-indigo-50 transition"
      >
        <ShoppingCart className="pr-2" />Cart
      </Link>

      <hr className="border-gray-400" />

      <button
        onClick={async () => {
          await logout();
          navigate("/");
        }}
        className="flex justify-center w-full text-center bg-red-500 text-white font-medium rounded-lg py-3 px-4 hover:bg-red-600 transition"
      >
        <LogOut className="pr-2"/>Logout
      </button>
    </div>
  );
}

export default MobileAccountPage;
