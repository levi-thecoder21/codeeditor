import { useState } from "react";
import useResponsive from "@/hooks/useResponsive";
import { sendAIRequest } from "@/utils/ai";
import { LuCopy } from "react-icons/lu";
import toast from "react-hot-toast";

// Define a TypeScript interface for response items
interface ResponseItem {
    type: "code" | "text"; // Ensures only "code" or "text" types
    content: string;
}

// Function to format response content properly
const formatText = (text: string) => {
    return text
        .replace(/\*\*(.*?)\*\*/g, (_, match) => `<strong>${match}</strong>`) // Make headings bold
        .replace(/\*(.*?)\*/g, "• $1"); // Convert * points to bullet (•)
};

function AIView() {
    const { viewHeight } = useResponsive();
    const [input, setInput] = useState("");
    const [response, setResponse] = useState<ResponseItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    const handleSend = async () => {
        setIsLoading(true);
        try {
            const aiResponse = await sendAIRequest(input);

            // ✅ Validate and format response properly
            const validResponses = aiResponse
                .filter((item: any) => item.type === "code" || item.type === "text") // Ensure valid types
                .map((item: any) => ({
                    type: item.type as "code" | "text", // Cast to correct type
                    content: item.content,
                }));

            setResponse(validResponses);
        } catch (error) {
            console.error("Error fetching AI response:", error);
            toast.error("Failed to get AI response");
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSend();
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
    };

    return (
        <div className="flex flex-col items-center gap-2 p-4" style={{ height: viewHeight }}>
            <h1 className="view-title">AI Assistance</h1>
            <input
                type="text"
                className="w-full rounded-md border-none bg-darkHover p-2 text-white outline-none"
                placeholder="Ask something..."
                value={input}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
            />
            <button
                className="flex w-full justify-center rounded-md bg-primary p-2 font-bold text-black outline-none"
                onClick={handleSend}
            >
                Submit
            </button>
            <div className="w-full flex-grow resize-none overflow-y-auto rounded-md border-none bg-darkHover p-2 text-white outline-none mt-4 relative">
                {isLoading ? (
                    <div className="text-center text-white">Generating...</div>
                ) : (
                    <>
                        {/* Code Blocks with Copy Button Fixed in Top-Right */}
                        {response
                            .filter((item) => item.type === "code")
                            .map((item, index) => (
                                <div key={index} className="relative bg-white text-black p-2 rounded-md my-2">
                                    <button
                                        className="absolute top-2 right-2 bg-gray-200 p-1 rounded"
                                        onClick={() => copyToClipboard(item.content)}
                                        title="Copy Code"
                                    >
                                        <LuCopy size={16} className="cursor-pointer text-black" />
                                    </button>
                                    <pre className="text-wrap">
                                        <code>{item.content}</code>
                                    </pre>
                                </div>
                            ))}

                        {/* Merged Explanation Block with Proper Formatting */}
                        {response.some((item) => item.type === "text") && (
                            <div className="bg-primary-300 text-white p-2 rounded-md my-2">
                                {response
                                    .filter((item) => item.type === "text")
                                    .map((item, index) => (
                                        <p
                                            key={index}
                                            className="mb-2"
                                            dangerouslySetInnerHTML={{ __html: formatText(item.content) }} // Render formatted text
                                        />
                                    ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default AIView;
