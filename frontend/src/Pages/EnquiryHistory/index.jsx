import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  getUserEnquiries,
  addEnquiryReply,
  markEnquiriesAsRead,
} from "../../utils/supabaseApi";
import { formatDateIST } from "../../utils/dateUtils";
import {
  FaHistory,
  FaReply,
  FaChevronDown,
  FaChevronUp,
  FaClock,
  FaUser,
  FaEnvelope,
} from "react-icons/fa";
import { MdMessage, MdSend } from "react-icons/md";

const EnquiryHistory = () => {
  const { currentUser } = useAuth();
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedEnquiry, setExpandedEnquiry] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [filterType, setFilterType] = useState("all"); // 'all', 'regular', 'custom_printing'

  useEffect(() => {
    if (currentUser?.id) {
      fetchUserEnquiries();
      markEnquiriesAsReadOnView();
    }
  }, [currentUser]);

  const fetchUserEnquiries = async () => {
    try {
      setLoading(true);
      const result = await getUserEnquiries(currentUser.id);
      if (result.success) {
        setEnquiries(result.enquiries);
      }
    } catch (error) {
      console.error("Error fetching enquiries:", error);
    } finally {
      setLoading(false);
    }
  };

  const markEnquiriesAsReadOnView = async () => {
    try {
      await markEnquiriesAsRead(currentUser.id);
      // Trigger header enquiry count update
      window.dispatchEvent(new Event("enquiryUpdated"));
    } catch (error) {
      console.error("Error marking enquiries as read:", error);
    }
  };

  const handleReply = async (enquiryId) => {
    if (!replyText.trim()) return;

    try {
      setSendingReply(true);
      const result = await addEnquiryReply(enquiryId, replyText, false, null);

      if (result.success) {
        setReplyText("");
        // Refresh enquiries to show the new reply
        await fetchUserEnquiries();
        // Trigger header enquiry count update
        window.dispatchEvent(new Event("enquiryUpdated"));
      }
    } catch (error) {
      console.error("Error sending reply:", error);
    } finally {
      setSendingReply(false);
    }
  };

  const calculateTotal = (items) =>
    items?.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
      0
    ) || 0;

  const toggleEnquiry = (enquiryId) => {
    setExpandedEnquiry(expandedEnquiry === enquiryId ? null : enquiryId);
  };

  // Filter enquiries based on type
  const filteredEnquiries = enquiries.filter((enquiry) => {
    if (filterType === "all") return true;
    if (filterType === "custom_printing")
      return enquiry.type === "custom_printing";
    if (filterType === "regular")
      return !enquiry.type || enquiry.type !== "custom_printing";
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FaHistory className="text-blue-600" />
              Enquiry History
            </h1>
            <p className="text-gray-600 mt-2">
              View and manage your product enquiries
            </p>
          </div>

          {/* Filter Section */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterType("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                All Enquiries ({enquiries.length})
              </button>
              <button
                onClick={() => setFilterType("regular")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === "regular"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                Regular Enquiries (
                {
                  enquiries.filter(
                    (e) => !e.type || e.type !== "custom_printing"
                  ).length
                }
                )
              </button>
              <button
                onClick={() => setFilterType("custom_printing")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === "custom_printing"
                    ? "bg-purple-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                Custom Printing (
                {enquiries.filter((e) => e.type === "custom_printing").length})
              </button>
            </div>
          </div>

          {filteredEnquiries.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <FaHistory className="text-6xl text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                {filterType === "all"
                  ? "No Enquiries Yet"
                  : `No ${
                      filterType === "custom_printing"
                        ? "Custom Printing"
                        : "Regular"
                    } Enquiries`}
              </h2>
              <p className="text-gray-500">
                {filterType === "all"
                  ? "You haven't made any enquiries yet. Start shopping to send your first enquiry!"
                  : `You don't have any ${
                      filterType === "custom_printing"
                        ? "custom printing requests"
                        : "regular enquiries"
                    } yet.`}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredEnquiries.map((enquiry) => (
                <div
                  key={enquiry.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  {/* Enquiry Header */}
                  <div
                    className="p-6 border-b cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleEnquiry(enquiry.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Enquiry #{enquiry.id.slice(-8)}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              enquiry.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {enquiry.status === "pending"
                              ? "Pending"
                              : "Replied"}
                          </span>
                          {enquiry.type === "custom_printing" && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              Custom Print
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-6 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <FaClock />
                            {formatDateIST(enquiry.created_at)}
                          </div>
                          <div className="flex items-center gap-1">
                            <MdMessage />
                            {enquiry.enquiry_replies?.length || 0} replies
                          </div>
                          <div className="font-medium">
                            {enquiry.type === "custom_printing" ? (
                              <>
                                {enquiry.enquiry_items?.[0]?.price > 0 ? (
                                  <span className="text-green-600">
                                    Estimated: ₹
                                    {enquiry.enquiry_items[0].price.toFixed(2)}
                                  </span>
                                ) : (
                                  <span className="text-gray-500">
                                    Price: Pending
                                  </span>
                                )}
                              </>
                            ) : (
                              `Total: ₹${calculateTotal(
                                enquiry.enquiry_items
                              ).toFixed(2)}`
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {enquiry.enquiry_replies?.some(
                          (reply) => reply.is_admin && !reply.read
                        ) && (
                          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        )}
                        {expandedEnquiry === enquiry.id ? (
                          <FaChevronUp />
                        ) : (
                          <FaChevronDown />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedEnquiry === enquiry.id && (
                    <div className="p-6">
                      {/* Enquiry Items */}
                      {enquiry.enquiry_items?.length > 0 && (
                        <div className="mb-6">
                          <h4 className="font-semibold mb-3">
                            Items Enquired:
                          </h4>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="space-y-3">
                              {enquiry.enquiry_items.map((item, index) => (
                                <div
                                  key={index}
                                  className="flex justify-between items-center"
                                >
                                  <div>
                                    <span className="font-medium">
                                      {item.product_name}
                                    </span>
                                    {item.customization && (
                                      <span className="text-sm text-gray-600 ml-2">
                                        ({item.customization})
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <div>Qty: {item.quantity}</div>
                                    <div className="font-medium">
                                      {enquiry.type === "custom_printing" &&
                                      item.price > 0 ? (
                                        <span className="text-green-600">
                                          Estimated: ₹
                                          {(item.price * item.quantity).toFixed(
                                            2
                                          )}
                                        </span>
                                      ) : enquiry.type === "custom_printing" ? (
                                        <span className="text-gray-500">
                                          Price: Pending Quote
                                        </span>
                                      ) : (
                                        `₹${(
                                          item.price * item.quantity
                                        ).toFixed(2)}`
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Custom Printing Details */}
                      {enquiry.type === "custom_printing" && (
                        <div className="mb-6">
                          <h4 className="font-semibold mb-3">
                            Custom Print Request Details:
                          </h4>
                          <div className="bg-blue-50 rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <span className="text-sm text-gray-600">
                                  Status:
                                </span>
                                <div className="font-medium">
                                  Print Request Submitted
                                </div>
                              </div>
                              <div>
                                <span className="text-sm text-gray-600">
                                  Processing:
                                </span>
                                <div className="font-medium text-blue-600">
                                  In Progress
                                </div>
                              </div>
                            </div>
                            <div className="mt-3 text-sm text-gray-600">
                              Our team will review your custom print request and
                              provide pricing details. You can continue the
                              conversation below to discuss any specific
                              requirements.
                              {enquiry.enquiry_items?.[0]?.price > 0 && (
                                <div className="mt-2 p-2 bg-green-50 rounded border">
                                  <strong>Price Updated:</strong> Our team has
                                  provided pricing for your request. Review the
                                  estimated cost above and continue the chat for
                                  any questions.
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Original Message */}
                      {enquiry.message && (
                        <div className="mb-6">
                          <h4 className="font-semibold mb-2">Your Message:</h4>
                          <div className="bg-blue-50 rounded-lg p-4">
                            <p className="text-gray-700">{enquiry.message}</p>
                          </div>
                        </div>
                      )}

                      {/* Chat Messages */}
                      <div className="mb-6">
                        <h4 className="font-semibold mb-3">Conversation:</h4>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                          {enquiry.enquiry_replies?.length > 0 ? (
                            enquiry.enquiry_replies.map((reply, index) => (
                              <div
                                key={index}
                                className={`flex ${
                                  !reply.is_admin
                                    ? "justify-end"
                                    : "justify-start"
                                }`}
                              >
                                <div
                                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                                    !reply.is_admin
                                      ? "bg-blue-600 text-white"
                                      : "bg-gray-200 text-gray-800"
                                  }`}
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    {reply.is_admin ? (
                                      <FaUser className="text-xs" />
                                    ) : (
                                      <FaEnvelope className="text-xs" />
                                    )}
                                    <span className="text-xs font-medium">
                                      {reply.is_admin ? "Admin" : "You"}
                                    </span>
                                  </div>
                                  <p className="text-sm">{reply.message}</p>
                                  <div className="text-xs opacity-75 mt-1">
                                    {formatDateIST(reply.created_at)}
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center text-gray-500 py-4">
                              No replies yet. We'll respond to your enquiry
                              soon!
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Reply Input */}
                      <div className="border-t pt-4">
                        <h4 className="font-semibold mb-3">Send a Reply:</h4>
                        <div className="flex gap-3">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Type your message here..."
                            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows="3"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleReply(enquiry.id);
                              }
                            }}
                          />
                          <button
                            onClick={() => handleReply(enquiry.id)}
                            disabled={!replyText.trim() || sendingReply}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            <MdSend />
                            {sendingReply ? "Sending..." : "Send"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnquiryHistory;
