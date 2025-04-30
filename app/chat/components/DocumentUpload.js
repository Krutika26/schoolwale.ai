// "use client"

// import React, { useRef } from "react";
// import { IoCloudUploadOutline } from "react-icons/io5";

// const DocumentUpload = () => {
//   const fileInputRef = useRef(null);

//   // Function to handle file selection and upload
//   const handleFileChange = async (event) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       console.log("Selected file:", file);

//       // Prepare the form data to send with the API request
//       const formData = new FormData();
//       formData.append("file", file);

//       try {
//         // Call the API to upload the file
//         const response = await fetch("/api/pdfiles", {
//           method: "POST",
//           body: formData,
//         });

//         if (!response.ok) {
//           throw new Error("Failed to upload the file.");
//         }

//         const responseData = await response.json();
//         console.log("Server response:", responseData);

//         // You can further handle the response here, e.g., show a success message

//       } catch (error) {
//         console.error("Error during file upload:", error);
//         // Handle the error appropriately
//       }
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
//     </div>
//   );
// };

// export default DocumentUpload;

"use client"

import React, { useRef } from "react";
import { IoCloudUploadOutline } from "react-icons/io5";

const DocumentUpload = ({ onFileUpload }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("Selected file:", file);
      // Send the file to the parent
      onFileUpload?.(file);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("/api/pdfiles", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to upload the file.");
        }

        const responseData = await response.json();
        console.log("Server response:", responseData);
      } catch (error) {
        console.error("Error during file upload:", error);
      }
    }
  };

  return (
    <div className="w-full max-w-full mx-auto p-6">
      <label htmlFor="file-upload" className="cursor-pointer bg-[#fff6e7] rounded-lg p-4 flex flex-col items-center space-y-2">
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
    </div>
  );
};

export default DocumentUpload;