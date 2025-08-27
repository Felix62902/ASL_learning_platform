import { useEffect, useState } from "react";
import api from "../../api";
import LessonLayout, {
  type LessonContentItem,
} from "../../layouts/LessonLayout";

function Fingerspelling() {
  const [content, setContent] = useState<LessonContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data
    const fetchData = async () => {
      try {
        const response = await api.get(
          "/api/lessons/?category_name=fingerspelling"
        );
        setContent(response.data); // 3. Save response in state
      } catch (error) {
        console.error("Failed to load lesson content", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData(); // 4. Call the async function
  }, []);
  return (
    <>
      <LessonLayout
        title="Fingerspelling"
        description="Master the building blocks of ASL. Learn to sign each letter of the alphabet"
        content={content}
      />
    </>
  );
}

export default Fingerspelling;
