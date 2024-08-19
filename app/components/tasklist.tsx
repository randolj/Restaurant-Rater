import { Form } from "@remix-run/react";
import { HiTrash } from "react-icons/hi2";

export interface TaskListProps {
  category: any;
  message: string;
  id: string;
}

export function Tasklist({ category, message, id }: TaskListProps) {
  return (
    <>
      <div className="flex justify-between items-center border p-3 rounded-xl">
        <div>
          <p className="text-lg">{message}</p>
          <span className="text-xs text-gray-400">{category}</span>
        </div>
        <div>
          <Form method="post">
            <button
              className="button"
              name="action"
              type="submit"
              value="delete"
            >
              <HiTrash />
            </button>
            <input type="hidden" name="id" value={id} />
          </Form>
        </div>
      </div>
    </>
  );
}
