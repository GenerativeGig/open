import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Form, Formik } from "formik";
import { useNavigate } from "react-router-dom";
import { InputField } from "../components/InputField";
import { RouteTitle } from "../components/RouteTitle";
import { useCreateSessionMutation } from "../generated/graphql";
import { useIsAuthenticated } from "../utils/useIsAuthenticated";

export function CreateSession() {
  useIsAuthenticated();

  const [, createSession] = useCreateSessionMutation();

  const navigate = useNavigate();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "text (optional)",
        emptyEditorClass:
          "before:float-left before:h-0 before:content-[attr(data-placeholder)] before:pointer-events-none text-[#9ca3af]",
      }),
    ],
    editorProps: {
      attributes: {
        class: "border-solid border m-2 p-1",
      },
    },
  });

  return (
    <>
      <RouteTitle>Create your Session</RouteTitle>
      <Formik
        initialValues={{
          title: "",
          startDate: "",
          startTime: "",
          stopDate: "",
          stopTime: "",
          attendeeLimit: 5,
          isRemote: true,
          location: null,
        }}
        onSubmit={async (
          {
            title,
            startDate,
            startTime,
            stopDate,
            stopTime,
            attendeeLimit,
            isRemote,
            location,
          },
          { setErrors }
        ) => {
          const start = new Date(startDate + ", " + startTime);
          const stop = new Date(stopDate + ", " + stopTime);

          const current = new Date();
          const currentWithoutTime = new Date(current.toLocaleDateString());

          const startWithoutTime = new Date(startDate);
          const stopWithoutTime = new Date(stopDate);

          if (startWithoutTime < currentWithoutTime) {
            setErrors({
              startDate: "Date has to be today or in the future",
            });
            return;
          }

          if (start < current) {
            setErrors({
              startTime: "Time has to be in the future",
            });
            return;
          }

          if (stopWithoutTime < startWithoutTime) {
            setErrors({
              stopDate: "Date has to be or come after start date",
            });
            return;
          }

          if (stop <= start) {
            setErrors({
              stopTime: "Time has to come after start time",
            });
            return;
          }

          const text = editor?.getHTML();

          const { error } = await createSession({
            input: {
              title,
              text: text || null,
              attendeeLimit,
              start,
              stop,
              isRemote,
              location,
            },
          });

          if (!error) {
            navigate("/sessions/upcoming");
          }
        }}
      >
        {({ isSubmitting, values: { isRemote } }) => (
          <Form className="h-full w-full flex flex-col items-center">
            <div className="m-2 p-8 w-full max-w-[768px] bg-slate-800 rounded-md border-solid border-2 border-pink-500">
              <div className="p-2 flex flex-col items-start">
                <InputField name="title" label="Title" placeholder="title" />
                <div className="flex items-center w-full">
                  <label htmlFor="text">Text</label>
                  <EditorContent
                    label="text"
                    className="w-[25.2em]"
                    editor={editor}
                  />
                </div>
                <div className="flex justify-between">
                  <InputField name="startDate" label="Start date" type="date" />
                  <InputField name="startTime" label="Start time" type="time" />
                </div>
                <div className="flex justify-between">
                  <InputField name="stopDate" label="Stop date" type="date" />
                  <InputField name="stopTime" label="Stop time" type="time" />
                </div>
                <InputField
                  className="w-16"
                  name="attendeeLimit"
                  label="Attendee limit"
                  type="number"
                  min={1}
                  defaultValue={5}
                />
                <InputField
                  name="isRemote"
                  label="Remote"
                  info={isRemote ? "Creates a voice channel" : ""}
                  type="checkbox"
                  required={false}
                />
                <InputField
                  name="location"
                  label="Location"
                  type="text"
                  placeholder="location (optional)"
                  required={false}
                />
                <button
                  type="submit"
                  className="self-end bg-pink-600 hover:bg-pink-500"
                >
                  Create Session
                </button>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </>
  );
}
