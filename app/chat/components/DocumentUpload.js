// "use client"

// import React, { useRef } from "react";
// import { IoCloudUploadOutline } from "react-icons/io5";

// const DocumentUpload = () => {
//   const fileInputRef = useRef(null);

//   const handleFileChange = (event) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       console.log("Selected file:", file);
//       // Handle file processing here (upload to server, preview, etc.)
//     }
//   };

//   return (
//     <div className="w-full max-w-full mx-auto p-6">
//       {/* Upload Section */}
//       <label
//         htmlFor="file-upload"
//         className="cursor-pointer bg-[#fff6e7] rounded-lg p-4 flex flex-col items-center space-y-2"
//       >
//         <IoCloudUploadOutline className="text-[#435e65]" size={40} strokeWidth={2.5} />
//         <p className="text-[#435e65] font-semibold">Upload PDF / Image / Word / Excel</p>
//         <input
//           id="file-upload"
//           type="file"
//           accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
//           className="hidden"
//           onChange={handleFileChange}
//           ref={fileInputRef}
//         />
//       </label>

//       {/* Task Options */}
//       <div className="mt-4 text-center">
//         <p className="text-gray-600 mb-3">
//           What do you want to do with uploaded data:
//         </p>

//         {/* Top 3 Action Buttons */}
//         <div className="flex justify-between gap-2">
//           <button className="bg-[#ebf6f2] text-[#435e65] px-4 py-2 rounded-lg w-1/3">
//             Explain Data
//           </button>
//           <button className="bg-[#ebf6f2] text-[#435e65] px-4 py-2 rounded-lg w-1/3">
//             Summarize Data
//           </button>
//           <button className="bg-[#f8f1e1] text-[#435e65] px-4 py-2 rounded-lg w-1/3">
//             Analyze Data
//           </button>
//         </div>

//         {/* Solve & Verify Buttons */}
//         <div className="flex justify-center gap-4 mt-5 bg-[#d2e7e2]">
//           <button className="bg-[#468081] hover:bg-[#468081]-600 text-white px-5 py-2 rounded-t-xl shadow w-1/3 mt-5">
//             Solve the Attached
//           </button>
//           <button className="bg-[#eb9b80] hover:bg-[#eb9b80]-600 text-white px-5 py-2 rounded-t-xl shadow w-1/3 mt-5">
//             Verify My Answer
//           </button>
//         </div>

//         {/* Hint */}
//         <p className="text-gray-500 text-sm mt-2 italic">
//           Works for all the subjects and classes.
//         </p>
//       </div>
//     </div>
//   );
// };

// export default DocumentUpload;

"use client"

import React, { useRef } from "react";
import { IoCloudUploadOutline } from "react-icons/io5";

const DocumentUpload = () => {
  const fileInputRef = useRef(null);

  // Function to handle file selection and upload
  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("Selected file:", file);

      // Prepare the form data to send with the API request
      const formData = new FormData();
      formData.append("file", file);

      try {
        // Call the API to upload the file
        const response = await fetch("/api/pdfiles", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to upload the file.");
        }

        const responseData = await response.json();
        console.log("Server response:", responseData);

        // You can further handle the response here, e.g., show a success message

      } catch (error) {
        console.error("Error during file upload:", error);
        // Handle the error appropriately
      }
    }
  };

  return (
    <div className="w-full max-w-full mx-auto p-6">
      {/* Upload Section */}
      <label
        htmlFor="file-upload"
        className="cursor-pointer bg-[#fff6e7] rounded-lg p-4 flex flex-col items-center space-y-2"
      >
        <IoCloudUploadOutline className="text-[#435e65]" size={40} strokeWidth={2.5} />
        <p className="text-[#435e65] font-semibold">Upload PDF / Image / Word / Excel</p>
        <input
          id="file-upload"
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
          className="hidden"
          onChange={handleFileChange}
          ref={fileInputRef}
        />
      </label>

      {/* Task Options */}
      <div className="mt-4 text-center">
        <p className="text-gray-600 mb-3">
          What do you want to do with uploaded data:
        </p>

        {/* Top 3 Action Buttons */}
        <div className="flex justify-between gap-2">
          <button className="bg-[#ebf6f2] text-[#435e65] px-4 py-2 rounded-lg w-1/3">
            Explain Data
          </button>
          <button className="bg-[#ebf6f2] text-[#435e65] px-4 py-2 rounded-lg w-1/3">
            Summarize Data
          </button>
          <button className="bg-[#f8f1e1] text-[#435e65] px-4 py-2 rounded-lg w-1/3">
            Analyze Data
          </button>
        </div>

        {/* Solve & Verify Buttons */}
        <div className="flex justify-center gap-4 mt-5 bg-[#d2e7e2]">
          <button className="bg-[#468081] hover:bg-[#468081]-600 text-white px-5 py-2 rounded-t-xl shadow w-1/3 mt-5">
            Solve the Attached
          </button>
          <button className="bg-[#eb9b80] hover:bg-[#eb9b80]-600 text-white px-5 py-2 rounded-t-xl shadow w-1/3 mt-5">
            Verify My Answer
          </button>
        </div>

        {/* Hint */}
        <p className="text-gray-500 text-sm mt-2 italic">
          Works for all the subjects and classes.
        </p>
      </div>
    </div>
  );
};

export default DocumentUpload;