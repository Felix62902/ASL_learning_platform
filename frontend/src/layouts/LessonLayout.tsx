import "../styles/Lesson.scss";

export interface LessonContentItem {
  title: string;
  description: string;
  // imageUrl?: string;
}

interface LessonLayoutProps {
  title: string;
  description: string;
  content: LessonContentItem[]; // list of dict
}

function LessonLayout({ title, description, content }: LessonLayoutProps) {
  return (
    <>
      <div className="title-and-searchbar">
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <div className="searchbar">search bar</div>
      </div>

      <div className="lessons-container">
        {/* .map() to loop over the content array */}
        {content.map((item, index) => (
          //  provide a unique "key" prop when mapping
          <div className="lesson-container" key={index}>
            <h3>{item.sign_name}</h3>
            <p>{item.description}</p>
            <p className="lesson-btn">Practice →</p>
          </div>
        ))}
      </div>
    </>
  );
}

export default LessonLayout;
