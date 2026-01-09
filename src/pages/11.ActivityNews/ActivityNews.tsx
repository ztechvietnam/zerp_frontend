/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef } from "react";
import PageContainer from "../../components/PageContainer/PageContainer";
import HomeContent from "./HomeContent";

const ActivityNews = () => {
  const pageContainerRef = useRef<HTMLDivElement>(null);

  return (
    <PageContainer ref={pageContainerRef}>
      <HomeContent />
    </PageContainer>
  );
};

export default ActivityNews;
