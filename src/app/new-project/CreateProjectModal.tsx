"use client";

import { useState } from "react";
import { createClient } from "../../../utils/supabase/client";

const supabase = createClient();

interface ProjectDetails {
  name: string;
  description: string;
  readme: string;
}

interface CreateProjectModalProps {
  projectDetails: ProjectDetails;
}

export function CreateProjectModal({ projectDetails }: CreateProjectModalProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setMessage("");

    const { name, description, readme } = projectDetails;
    const { data: user } = await supabase.auth.getUser();

    const { error } = await supabase.from("projects").insert([
      {
        name,
        description,
        readme,
        created_by: user?.user?.id || null, // Set user ID if authenticated
        closed: false,
      },
    ]);

    if (error) {
      setMessage(`Error saving project: ${error.message}`);
    } else {
      setMessage("Project saved successfully!");
    }

    setLoading(false);
  };

  return (
    <div>
      <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 bg-green-500 text-white">
        {loading ? "Saving..." : "Save Project"}
      </button>
      {message && <p className="mt-2 text-sm">{message}</p>}
    </div>
  );
}