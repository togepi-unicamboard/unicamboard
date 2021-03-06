import { supabase } from "../utils/supabase";
import { MessageButtons } from "../components/MessageButtons";
import { DeletePostButton } from "../components/DeletePostButton";
import { withProtected } from "../hooks/route";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useUser } from "../context/user";

const ReplyPage = ({ message, replies }) => {
  const { user } = useUser();
  const [body, setBody] = useState("");
  const [customId, setCustomId] = useState("Utente anonimo");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (customId === "Utente anonimo" && user && user.custom_id) {
      setCustomId(user.custom_id);
    }
  });

  const handleSendReply = async (body) => {
    try {
      setLoading(true);
      if (body === "")
        throw new Error("Il corpo della risposta deve essere compilata!");
      const { error } = await supabase.from("reply").insert({
        body: body,
        profile_id: user.id,
        post_id: message.id,
        custom_id: customId,
      });
      if (error) throw error;
      router.push(`/${message.id}`);
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
      setBody("");
    }
  };

  function renderReplies() {
    return replies.map((reply) => (
      <div
        className="rounded-xl m-8 p-8 md:p-4 shadow-sm shadow-slate-300"
        key={reply.id}
      >
        <div className="flex justify-between h-24 rounded-full mx-auto">
          <span className="text-sm">{reply.custom_id}</span>
        </div>
        <div className="flex flex-col items-center py-2">
          <p className="text-md font-thin">{reply.body}</p>
        </div>
      </div>
    ));
  }

  return (
    <div>
      <div
        className="rounded-xl m-8 p-8 md:p-4 shadow-sm shadow-slate-300"
        key={message.id}
      >
        <div className="flex justify-between h-24 rounded-full mx-auto">
          <span className="text-sm">
            {message.custom_id}
          </span>
          <span className="text-sm">Interazioni: {message.engagement}</span>
        </div>
        <DeletePostButton message={message} />
        <div className="text-center">
          <span className="text-lg font-bold">{message.title}</span>
        </div>
        <div className="flex flex-col items-center py-2">
          <p className="text-md font-thin">{message.body}</p>
        </div>
        <div>
          <MessageButtons message={message} />
        </div>
      </div>

      {renderReplies()}

      <div className="h-auto w-fill text-center px-6 py-4">
        <h2 className="text-lg font-bold">Scrivi una risposta:</h2>
        <p className="text-sm">Stai postando come: {customId}</p>
        <div className="py-4">
          <textarea
            className="border-b-2 content-center w-fit"
            placeholder="Scrivi una risposta..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>
        <div>
          <button
            onClick={(e) => {
              e.preventDefault();
              handleSendReply(body);
            }}
            className="p-4 font-medium"
            disabled={loading}
          >
            <span>{loading ? "Mandando..." : "Rispondi"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps = async ({ params: { messageId } }) => {
  const { data: message } = await supabase
    .from("post")
    .select("*")
    .eq("id", messageId)
    .single();
  const { data: replies } = await supabase
    .from("reply")
    .select("*")
    .eq("post_id", message.id);
  return {
    props: {
      message,
      replies,
    },
  };
};

export default withProtected(ReplyPage);
