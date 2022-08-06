import { getFilePath } from "@/supabase/supabase-client";

const makeNewStorageFilename = async (
  file_id: number,
  temp_user_id: string,
  user_id: string
) => {
  const { data, error } = await getFilePath(file_id);
  if (!data || error)
    return {
      oldName: "",
      newName: "",
    };

  const fileName = data.file_name.split(`tempnft/${temp_user_id}/`)[1];
  const newName = `${user_id}/${fileName}`;
  return {
    oldName: data.file_name,
    newName,
  };
};

export default makeNewStorageFilename;
