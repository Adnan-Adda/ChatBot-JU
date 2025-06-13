import {useChatHandler} from "@/components/chat/chat-hooks/use-chat-handler"
import {ChatbotUIContext} from "@/context/context"
import {LLM_LIST} from "@/lib/models/llm/llm-list"
import {cn} from "@/lib/utils"
import {Tables} from "@/supabase/types"
import {LLM, LLMID, MessageImage, ModelProvider} from "@/types"
import {
    IconBolt,
    IconCaretDownFilled,
    IconCaretRightFilled,
    IconCircleFilled,
    IconFileText,
    IconMoodSmile,
    IconPencil
} from "@tabler/icons-react"
import Image from "next/image"
import {FC, useContext, useEffect, useRef, useState} from "react"
import {ModelIcon} from "../models/model-icon"
import {Button} from "../ui/button"
import {FileIcon} from "../ui/file-icon"
import {FilePreview} from "../ui/file-preview"
import {TextareaAutosize} from "../ui/textarea-autosize"
import {WithTooltip} from "../ui/with-tooltip"
import {MessageActions} from "./message-actions"
import {MessageMarkdown} from "./message-markdown"
import {ThumbsUp, ThumbsDown} from 'lucide-react';

const ICON_SIZE = 32

interface MessageProps {
    message: Tables<"messages">
    fileItems: Tables<"file_items">[]
    isEditing: boolean
    isLast: boolean
    onStartEdit: (message: Tables<"messages">) => void
    onCancelEdit: () => void
    onSubmitEdit: (value: string, sequenceNumber: number) => void
}

export const Message: FC<MessageProps> = ({
                                              message,
                                              fileItems,
                                              isEditing,
                                              isLast,
                                              onStartEdit,
                                              onCancelEdit,
                                              onSubmitEdit
                                          }) => {
    const {
        assistants,
        profile,
        isGenerating,
        setIsGenerating,
        firstTokenReceived,
        availableLocalModels,
        availableOpenRouterModels,
        chatMessages,
        selectedAssistant,
        chatImages,
        assistantImages,
        toolInUse,
        files,
        models
    } = useContext(ChatbotUIContext)

    /*===================================Handle Feedback=========================================================*/

    const handleFeedback = async (messageId: string, type: 'like' | 'dislike') => {
        const assistantWrapper = chatMessages.find(m => m.message.id === messageId);
        const assistantMessage = assistantWrapper?.message;

        if (!assistantMessage || assistantMessage.role !== 'assistant') return;

        const userWrapper = [...chatMessages]
            .map(m => m.message)
            .reverse()
            .find(m => m.role === 'user' && m.sequence_number < assistantMessage.sequence_number);

        const query = userWrapper?.content || 'Unknown';

        try {
            const res = await fetch("http://localhost:4000/feedback", {
                method: "POST",
                headers: {
                    "x-api-key": process.env.NEXT_PUBLIC_REALITY_CHECK_API_KEY!,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user: profile?.id || "anonymous",
                    query: query,
                    answer: message.content,
                    feedback: type === "like" ? 0 : 1,
                    llm_type: message.model || "Undefined",
                }),
            });
            const data = await res.json();

            if (res.ok) {
                console.log("RealityCheck with feedback result:", data.message);
            } else {
                console.error("RealityCheck with feedback error:", data);
            }
        } catch (err) {
            console.error("RealityCheck with feedback API call failed:", err);
        }

        // Store feedback in local storage
        localStorage.setItem(`feedback_${messageId}`, type);
    };

    const FeedbackButtons = ({message, handleFeedback}: {
        message: Tables<"messages">;
        handleFeedback: (id: string, type: 'like' | 'dislike') => void;
    }) => {

        const [feedbackGiven, setFeedbackGiven] = useState<'like' | 'dislike' | null>(null);

        // Load feedback from local storage on mount
        useEffect(() => {
            const storedFeedback = localStorage.getItem(`feedback_${message.id}`);
            if (storedFeedback === 'like' || storedFeedback === 'dislike') {
                setFeedbackGiven(storedFeedback);
            }
        }, [message.id]);

        const handleClick = (type: 'like' | 'dislike') => {
            if (feedbackGiven === null) {
                handleFeedback(message.id, type);
                setFeedbackGiven(type);
            }
        };

        return message.role === 'assistant' ? (
            <div className="flex space-x-2 mt-2">
                <button
                    onClick={() => handleClick('like')}
                    className={`transition-colors duration-200 ${
                        feedbackGiven === 'like'
                            ? 'text-green-500 cursor-default'
                            : feedbackGiven === 'dislike'
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-500 hover:text-green-500'
                    }`}
                    disabled={feedbackGiven !== null}
                >
                    <ThumbsUp size={18}/>
                </button>
                <button
                    onClick={() => handleClick('dislike')}
                    className={`transition-colors duration-200 ${
                        feedbackGiven === 'dislike'
                            ? 'text-red-500 cursor-default'
                            : feedbackGiven === 'like'
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-500 hover:text-red-500'
                    }`}
                    disabled={feedbackGiven !== null}
                >
                    <ThumbsDown size={18}/>
                </button>
            </div>
        ) : null;
    };

    const {handleSendMessage} = useChatHandler()

    const editInputRef = useRef<HTMLTextAreaElement>(null)

    const [isHovering, setIsHovering] = useState(false)
    const [editedMessage, setEditedMessage] = useState(message.content)

    const [showImagePreview, setShowImagePreview] = useState(false)
    const [selectedImage, setSelectedImage] = useState<MessageImage | null>(null)

    const [showFileItemPreview, setShowFileItemPreview] = useState(false)
    const [selectedFileItem, setSelectedFileItem] =
        useState<Tables<"file_items"> | null>(null)

    const [viewSources, setViewSources] = useState(false)

    const handleCopy = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(message.content)
        } else {
            const textArea = document.createElement("textarea")
            textArea.value = message.content
            document.body.appendChild(textArea)
            textArea.focus()
            textArea.select()
            document.execCommand("copy")
            document.body.removeChild(textArea)
        }
    }

    const handleSendEdit = () => {
        onSubmitEdit(editedMessage, message.sequence_number)
        onCancelEdit()
    }

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (isEditing && event.key === "Enter" && event.metaKey) {
            handleSendEdit()
        }
    }

    const handleRegenerate = async () => {
        setIsGenerating(true)
        await handleSendMessage(
            editedMessage || chatMessages[chatMessages.length - 2].message.content,
            chatMessages,
            true
        )
    }

    const handleStartEdit = () => {
        onStartEdit(message)
    }

    useEffect(() => {
        setEditedMessage(message.content)

        if (isEditing && editInputRef.current) {
            const input = editInputRef.current
            input.focus()
            input.setSelectionRange(input.value.length, input.value.length)
        }
    }, [isEditing])

    const MODEL_DATA = [
        ...models.map(model => ({
            modelId: model.model_id as LLMID,
            modelName: model.name,
            provider: "custom" as ModelProvider,
            hostedId: model.id,
            platformLink: "",
            imageInput: false
        })),
        ...LLM_LIST,
        ...availableLocalModels,
        ...availableOpenRouterModels
    ].find(llm => llm.modelId === message.model) as LLM

    const messageAssistantImage = assistantImages.find(
        image => image.assistantId === message.assistant_id
    )?.base64

    const selectedAssistantImage = assistantImages.find(
        image => image.path === selectedAssistant?.image_path
    )?.base64

    const modelDetails = LLM_LIST.find(model => model.modelId === message.model)

    const fileAccumulator: Record<
        string,
        {
            id: string
            name: string
            count: number
            type: string
            description: string
        }
    > = {}

    const fileSummary = fileItems.reduce((acc, fileItem) => {
        const parentFile = files.find(file => file.id === fileItem.file_id)
        if (parentFile) {
            if (!acc[parentFile.id]) {
                acc[parentFile.id] = {
                    id: parentFile.id,
                    name: parentFile.name,
                    count: 1,
                    type: parentFile.type,
                    description: parentFile.description
                }
            } else {
                acc[parentFile.id].count += 1
            }
        }
        return acc
    }, fileAccumulator)

    return (
        <div
            className={cn(
                "flex w-full justify-center",
                message.role === "user" ? "" : "bg-secondary"
            )}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onKeyDown={handleKeyDown}
        >
            <div
                className="relative flex w-full flex-col p-6 sm:w-[550px] sm:px-0 md:w-[650px] lg:w-[650px] xl:w-[700px]">
                <div className="absolute right-5 top-7 sm:right-0">
                    <MessageActions
                        onCopy={handleCopy}
                        onEdit={handleStartEdit}
                        isAssistant={message.role === "assistant"}
                        isLast={isLast}
                        isEditing={isEditing}
                        isHovering={isHovering}
                        onRegenerate={handleRegenerate}
                    />
                </div>
                <div className="space-y-3">
                    {message.role === "system" ? (
                        <div className="flex items-center space-x-4">
                            <IconPencil
                                className="border-primary bg-primary text-secondary rounded border-DEFAULT p-1"
                                size={ICON_SIZE}
                            />

                            <div className="text-lg font-semibold">Prompt</div>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-3">
                            {message.role === "assistant" ? (
                                messageAssistantImage ? (
                                    <Image
                                        style={{
                                            width: `${ICON_SIZE}px`,
                                            height: `${ICON_SIZE}px`
                                        }}
                                        className="rounded"
                                        src={messageAssistantImage}
                                        alt="assistant image"
                                        height={ICON_SIZE}
                                        width={ICON_SIZE}
                                    />
                                ) : (
                                    <WithTooltip
                                        display={<div>{MODEL_DATA?.modelName}</div>}
                                        trigger={
                                            <ModelIcon
                                                provider={modelDetails?.provider || "custom"}
                                                height={ICON_SIZE}
                                                width={ICON_SIZE}
                                            />
                                        }
                                    />
                                )
                            ) : profile?.image_url ? (
                                <Image
                                    className={`size-[32px] rounded`}
                                    src={profile?.image_url}
                                    height={32}
                                    width={32}
                                    alt="user image"
                                />
                            ) : (
                                <IconMoodSmile
                                    className="bg-primary text-secondary border-primary rounded border-DEFAULT p-1"
                                    size={ICON_SIZE}
                                />
                            )}

                            <div className="font-semibold">
                                {message.role === "assistant"
                                    ? message.assistant_id
                                        ? assistants.find(
                                            assistant => assistant.id === message.assistant_id
                                        )?.name
                                        : selectedAssistant
                                            ? selectedAssistant?.name
                                            : MODEL_DATA?.modelName
                                    : profile?.display_name ?? profile?.username}
                            </div>
                        </div>
                    )}
                    {!firstTokenReceived &&
                    isGenerating &&
                    isLast &&
                    message.role === "assistant" ? (
                        <>
                            {(() => {
                                switch (toolInUse) {
                                    case "none":
                                        return (
                                            <IconCircleFilled className="animate-pulse" size={20}/>
                                        )
                                    case "retrieval":
                                        return (
                                            <div className="flex animate-pulse items-center space-x-2">
                                                <IconFileText size={20}/>

                                                <div>Searching files...</div>
                                            </div>
                                        )
                                    default:
                                        return (
                                            <div className="flex animate-pulse items-center space-x-2">
                                                <IconBolt size={20}/>

                                                <div>Using {toolInUse}...</div>
                                            </div>
                                        )
                                }
                            })()}
                        </>
                    ) : isEditing ? (
                        <TextareaAutosize
                            textareaRef={editInputRef}
                            className="text-md"
                            value={editedMessage}
                            onValueChange={setEditedMessage}
                            maxRows={20}
                        />
                    ) : (
                        <MessageMarkdown content={message.content}/>
                    )}

                    <FeedbackButtons message={message} handleFeedback={handleFeedback}/>
                </div>

                {fileItems.length > 0 && (
                    <div className="border-primary mt-6 border-t pt-4 font-bold">
                        {!viewSources ? (
                            <div
                                className="flex cursor-pointer items-center text-lg hover:opacity-50"
                                onClick={() => setViewSources(true)}
                            >
                                {fileItems.length}
                                {fileItems.length > 1 ? " Sources " : " Source "}
                                from {Object.keys(fileSummary).length}{" "}
                                {Object.keys(fileSummary).length > 1 ? "Files" : "File"}{" "}
                                <IconCaretRightFilled className="ml-1"/>
                            </div>
                        ) : (
                            <>
                                <div
                                    className="flex cursor-pointer items-center text-lg hover:opacity-50"
                                    onClick={() => setViewSources(false)}
                                >
                                    {fileItems.length}
                                    {fileItems.length > 1 ? " Sources " : " Source "}
                                    from {Object.keys(fileSummary).length}{" "}
                                    {Object.keys(fileSummary).length > 1 ? "Files" : "File"}{" "}
                                    <IconCaretDownFilled className="ml-1"/>
                                </div>

                                <div className="mt-3 space-y-4">
                                    {Object.values(fileSummary).map((file, index) => (
                                        <div key={index}>
                                            <div className="flex items-center space-x-2">
                                                <div>
                                                    <FileIcon type={file.type}/>
                                                </div>

                                                <div className="truncate">{file.name}</div>
                                            </div>

                                            {fileItems
                                                .filter(fileItem => {
                                                    const parentFile = files.find(
                                                        parentFile => parentFile.id === fileItem.file_id
                                                    )
                                                    return parentFile?.id === file.id
                                                })
                                                .map((fileItem, index) => (
                                                    <div
                                                        key={index}
                                                        className="ml-8 mt-1.5 flex cursor-pointer items-center space-x-2 hover:opacity-50"
                                                        onClick={() => {
                                                            setSelectedFileItem(fileItem)
                                                            setShowFileItemPreview(true)
                                                        }}
                                                    >
                                                        <div className="text-sm font-normal">
                                                            <span className="mr-1 text-lg font-bold">-</span>{" "}
                                                            {fileItem.content.substring(0, 200)}...
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                <div className="mt-3 flex flex-wrap gap-2">
                    {message.image_paths.map((path, index) => {
                        const item = chatImages.find(image => image.path === path)

                        return (
                            <Image
                                key={index}
                                className="cursor-pointer rounded hover:opacity-50"
                                src={path.startsWith("data") ? path : item?.base64}
                                alt="message image"
                                width={300}
                                height={300}
                                onClick={() => {
                                    setSelectedImage({
                                        messageId: message.id,
                                        path,
                                        base64: path.startsWith("data") ? path : item?.base64 || "",
                                        url: path.startsWith("data") ? "" : item?.url || "",
                                        file: null
                                    })

                                    setShowImagePreview(true)
                                }}
                                loading="lazy"
                            />
                        )
                    })}
                </div>
                {isEditing && (
                    <div className="mt-4 flex justify-center space-x-2">
                        <Button size="sm" onClick={handleSendEdit}>
                            Save & Send
                        </Button>

                        <Button size="sm" variant="outline" onClick={onCancelEdit}>
                            Cancel
                        </Button>
                    </div>
                )}
            </div>

            {showImagePreview && selectedImage && (
                <FilePreview
                    type="image"
                    item={selectedImage}
                    isOpen={showImagePreview}
                    onOpenChange={(isOpen: boolean) => {
                        setShowImagePreview(isOpen)
                        setSelectedImage(null)
                    }}
                />
            )}

            {showFileItemPreview && selectedFileItem && (
                <FilePreview
                    type="file_item"
                    item={selectedFileItem}
                    isOpen={showFileItemPreview}
                    onOpenChange={(isOpen: boolean) => {
                        setShowFileItemPreview(isOpen)
                        setSelectedFileItem(null)
                    }}
                />
            )}
        </div>
    )
}
