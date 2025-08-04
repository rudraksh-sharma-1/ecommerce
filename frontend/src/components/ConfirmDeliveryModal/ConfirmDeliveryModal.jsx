import React from "react";
import { Dialog } from "@headlessui/react";

const ConfirmDeliveryModal = ({ isOpen, onClose, address, onConfirm }) => {
  if (!address) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <Dialog.Panel className="bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl">
          <Dialog.Title className="text-lg font-semibold mb-4 text-white">Confirm Delivery Address</Dialog.Title>
          <div className="text-sm space-y-1 text-gray-900 dark:text-gray-300">
            {address.formatted_address ? (
              <p>{address.formatted_address}</p>
            ) : (
              <>
                <p>{address.house_number}, {address.street_address}</p>
                <p>{address.city}, {address.state} - {address.postal_code}</p>
                <p>{address.country}</p>
              </>
            )}
          </div>

          <div className="mt-6 flex justify-end space-x-2">
            <button onClick={onClose} className="px-4 py-2 text-sm bg-gray-700 text-white dark:bg-gray-700 rounded hover:bg-gray-500">
              Cancel
            </button>
            <button onClick={onConfirm} className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
              Confirm
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ConfirmDeliveryModal;
