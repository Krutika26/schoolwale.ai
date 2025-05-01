import { useState } from "react";
import dayjs from "dayjs";

const defaultOptions = [
  {
    title: "Your Maths Buddy",
    options: ["Arithmetic", "Algebra", "Geometry", "Trigonometry", "Statistics", "Calculus"],
  },
  {
    title: "Curriculum Based Q&A",
    options: ["All subjects", "ICSE", "CBSE", "International Board", "State Board"],
  },
  {
    title: "English Grammar Assistant",
    options: ["English", "Essay", "Grammar", "Writing", "Detect"],
  },
  {
    title: "Science Explorer",
    options: ["Physics", "Space", "Astronomy", "Chemistry", "History/Geography"],
  },
];

// Get category title based on first word of human message
function getCategoryTitleFromMessage(msg) {
    const humanText = msg.messageJson.find((m) => m.type === 'human')?.text || "";
    const firstWord = humanText.split(" ")[0].toLowerCase();
  
    for (const group of defaultOptions) {
      for (const option of group.options) {
        if (option.toLowerCase() === firstWord) {
          return group.title;
        }
      }
    }
  
    return "Other";
  }  
  
// Group messages by category titles
function groupByCategory(messages) {
  const grouped = {};
  messages.forEach((msg) => {
    const title = getCategoryTitleFromMessage(msg);
    if (!grouped[title]) grouped[title] = [];
    grouped[title].push(msg);
  });
  return grouped;
}

// Format section heading like "Today", "Yesterday", "March 2025"
function getSectionHeading(key, msgArray) {
  if (["today", "yesterday", "last7Days", "last30Days"].includes(key)) {
    const map = {
      today: "Today",
      yesterday: "Yesterday",
      last7Days: "Last 7 Days",
      last30Days: "Last 30 Days",
    };
    return map[key];
  } else {
    // Key is ISO date string of a past month
    const sampleMsg = msgArray[0];
    const date = dayjs(sampleMsg.sentAt);
    return date.format("MMMM YYYY"); // e.g., "March 2025"
  }
}

export default function GroupedMessagesAll({ groupedMessages }) {
  const [showPopup, setShowPopup] = useState(false);
  const [popupContent, setPopupContent] = useState("");

  // Combine all date buckets including custom month groupings
  const allGroups = {
    today: groupedMessages.today || [],
    yesterday: groupedMessages.yesterday || [],
    last7Days: groupedMessages.last7Days || [],
    last30Days: groupedMessages.last30Days || [],
    ...groupedMessages.previousMonths, // e.g., { "2025-03": [...], "2025-02": [...] }
  };

  return (
    <div className="p-4">
      {Object.entries(allGroups).map(([key, msgArray]) => {
        if (!msgArray.length) return null;

        const sectionHeading = getSectionHeading(key, msgArray);
        const categorized = groupByCategory(msgArray);

        return (
          <div key={key} className="mb-8">
            <h2 className="text-xl font-bold mb-3">{sectionHeading}</h2>
            {Object.entries(categorized).map(([categoryTitle, messages]) => (
              <div key={categoryTitle} className="mb-4">
                <h3 className="text-md font-semibold mb-2">{categoryTitle}</h3>
                {messages.map((msg) => {
                  const humanMsg = msg.messageJson.find(m => m.type === 'human')?.text || "";
                  const aiMsg = msg.messageJson.find(m => m.type === 'ai')?.text || "";

                  return (
                    <div
                      key={msg.id}
                      className="cursor-pointer text-blue-600 underline hover:text-blue-800 my-1"
                      onClick={() => {
                        setPopupContent(aiMsg);
                        setShowPopup(true);
                      }}
                    >
                      {humanMsg}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          );
      })}

          {/* Popup */}
          {showPopup && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded-xl max-w-md w-full max-h-[40vh] overflow-y-auto shadow-lg">
                      <div className="text-gray-800 whitespace-pre-wrap">{popupContent}</div>
                      <button
                          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                          onClick={() => setShowPopup(false)}
                      >
                          Close
                      </button>
                  </div>
              </div>
          )}

      </div>
  );
}
