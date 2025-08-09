/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { Form, Input, Progress } from "antd";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { listQuestions } from "../../components/constant/constant";

interface QualityReviewProps {
  open: boolean;
  onClose: () => void;
}

export const QualityReview: React.FC<QualityReviewProps> = ({
  open,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentStepProgress, setCurrentStepProgress] = useState(0);
  const [percent, setPercent] = useState(0);
  const [percentLoading, setPercentLoading] = useState(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [selected, setSelected] = useState<string>("");
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);
  const [showFinishReview, setShowFinishReview] = useState(false);
  const [form] = Form.useForm();
  const textareaRef = useRef(null);
  const [countdown, setCountdown] = useState(10);
  const countdownRef = useRef<number | null>(null);
  const percentLoadingRef = useRef<number | null>(null);
  const currentQuestion = listQuestions[currentStep];
  const currentQuestionId = currentQuestion?.id;
  const stepProgress = currentStep >= 2 ? 4 : currentStep + 1;

  useEffect(() => {
    if (currentQuestion?.type === "TEXT" && textareaRef.current) {
      (textareaRef.current as any)?.focus();
    }
    if (currentQuestion?.type === "FORM") {
      form.setFieldsValue(answers[currentQuestionId] || {});
    }
  }, [currentStep, currentQuestion, answers, currentQuestionId, form]);

  const onCloseReview = useCallback(() => {
    onClose();
    setAnswers({});
    setCurrentStep(0);
    setSelected("");
    setShowFinishReview(false);
    setPercentLoading(0);
    form.resetFields();
  }, [onClose, form]);

  useEffect(() => {
    if (showFinishReview) {
      setCountdown(10);

      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            clearInterval(countdownRef.current!);
            onCloseReview();
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(countdownRef.current!);
  }, [onCloseReview, showFinishReview]);

  const handleNext = () => {
    if (
      ((currentQuestionId == "q1" || currentQuestionId == "q2") &&
        selected === "" &&
        !answers[currentQuestionId]) ||
      (currentQuestionId == "q3" && !answers[currentQuestionId])
    ) {
      setShowError(true);
    } else {
      if (
        (currentQuestionId == "q1" || currentQuestionId == "q2") &&
        selected !== ""
      ) {
        const newAnswers = { ...answers, [currentQuestionId]: selected };
        setAnswers(newAnswers);
      }

      if (
        currentQuestionId === "q1" &&
        (selected !== ""
          ? selected === "no"
          : answers[currentQuestionId] === "no")
      ) {
        setShowFinishReview(true);
      }
      if (
        currentQuestionId === "q2" &&
        (selected !== ""
          ? selected === "yes"
          : answers[currentQuestionId] === "yes")
      ) {
        setShowFinishReview(true);
      }

      setShowError(false);
      setIsAnimatingOut(true);

      setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
        setSelected("");
        setIsAnimatingOut(false);
        setIsAnimatingIn(true);

        setTimeout(() => {
          setIsAnimatingIn(false);
        }, 200);
      }, 200);
    }
  };

  const handleFormFinish = (values: any) => {
    const newAnswers = { ...answers, [currentQuestionId]: values };
    console.log(newAnswers);
    setShowFinishReview(true);
    setLoading(true);
    setPercentLoading(0);

    if (percentLoadingRef.current) {
      clearInterval(percentLoadingRef.current);
    }

    percentLoadingRef.current = window.setInterval(() => {
      setPercentLoading((prev) => {
        const next = prev + 10;

        if (next >= 100) {
          clearInterval(percentLoadingRef.current!);
          setTimeout(() => setLoading(false), 300);
          return 100;
        }

        return next;
      });
    }, 100);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onCloseReview();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onCloseReview]);

  const nameValue = Form.useWatch("name", form);
  const phoneValue = Form.useWatch("phone", form);

  useEffect(() => {
    if (currentQuestionId === "q1") {
      if (selected ? selected : answers[currentQuestionId]) {
        setCurrentStepProgress(1);
        setPercent(100);
      } else {
        setCurrentStepProgress(0);
        setPercent(0);
      }
    }
    if (currentQuestionId === "q2") {
      if (selected ? selected : answers[currentQuestionId]) {
        setCurrentStepProgress(2);
        setPercent(100);
      } else {
        setCurrentStepProgress(1);
        setPercent(50);
      }
    }
    if (currentQuestionId === "q3") {
      if (answers[currentQuestionId]) {
        setCurrentStepProgress(3);
        setPercent(75);
      } else {
        setCurrentStepProgress(2);
        setPercent(50);
      }
    }
    if (currentQuestionId === "q4") {
      if (nameValue && phoneValue) {
        setCurrentStepProgress(4);
        setPercent(100);
      } else {
        setCurrentStepProgress(3);
        setPercent(75);
      }
    }
  }, [selected, answers, nameValue, phoneValue, currentQuestionId]);

  return (
    <div
      className={`fixed inset-0 z-1001 flex items-center justify-center transition-opacity duration-300 ${
        open
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
      style={{
        fontFamily: "Roboto",
        backgroundImage: `url('/images/background/bg.jpg')`,
        width: "100%",
        height: "100%",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
      <div className="h-full w-full bg-black absolute top-0 left-0 opacity-[0.15]"></div>

      <div className="relative w-full h-full bg-transparent flex items-center justify-center">
        <button
          onClick={onCloseReview}
          className="absolute top-4 right-4 text-[#f0f0f0] transition flex text-[24px]"
          aria-label="Đóng"
        >
          <CloseOutlined />
        </button>
        {showFinishReview ? (
          <div
            key={currentStep}
            className={`bg-white rounded-xl shadow-lg w-[80vw] h-fit p-[64px] overflow-y-auto relative z-10 transition-all duration-300 ease-in-out transform
          ${
            isAnimatingOut
              ? "opacity-0 translate-y-10 scale-95"
              : isAnimatingIn
              ? "opacity-0 -translate-y-10 scale-95"
              : "opacity-[0.95] translate-y-0 scale-100"
          }`}
          >
            {loading ? (
              <div className="flex flex-col w-full items-center justify-center gap-[10px]">
                <Progress
                  percent={percentLoading}
                  showInfo
                  strokeColor="#7ca9bc"
                  trailColor="#e0e0e0"
                  className="w-[200px] mt-2 transition-all duration-500"
                />
                <div className="text-[16px] text-[#7ca9bc]">Đang xử lý...</div>
              </div>
            ) : (
              <>
                <div className="flex flex-col leading-[1.3] items-center text-[16px] font-extrabold text-[#2f2f2f] text-justify mb-[56px]">
                  TRÂN TRỌNG CẢM ƠN !
                </div>
                <div className="flex flex-col items-center w-full text-[16px] text-[#444444] text-justify p-[16px] mb-[15px]">
                  Bệnh viện Quốc tế Sản Nhi Hải Phòng trân trọng cảm ơn Quý
                  khách
                </div>

                <div className="flex justify-center">
                  <div
                    className="px-[0.3rem] py-[0.3rem] pl-[2rem] rounded-full cursor-pointer border-none bg-[linear-gradient(30deg,_rgb(124,_169,_188),_rgb(124,_169,_188))] transition-transform duration-100 ease-linear"
                    onClick={() => {
                      onCloseReview();
                      clearInterval(countdownRef.current!);
                    }}
                  >
                    <span className="text-[#fff] text-[1.2em] leading-[2.5rem] mr-6">
                      Về trang chủ
                    </span>

                    <div className="w-8 h-8 leading-8 inline-block relative font-bold text-center rounded-full text-white bg-black/20">
                      {countdown}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div
            key={currentStep}
            className={`bg-white rounded-xl shadow-lg w-[80vw] h-fit p-[64px] overflow-y-auto relative z-10 transition-all duration-300 ease-in-out transform
          ${
            isAnimatingOut
              ? "opacity-0 translate-y-10 scale-95"
              : isAnimatingIn
              ? "opacity-0 -translate-y-10 scale-95"
              : "opacity-[0.95] translate-y-0 scale-100"
          }`}
          >
            {currentQuestionId == "q1" && (
              <div className="flex w-full items-center justify-center opacity-[0.5]">
                <div
                  style={{
                    backgroundImage: `url('/images/logo/logoReview.jpg')`,
                    width: "150px",
                    height: "150px",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "cover",
                  }}
                ></div>
              </div>
            )}
            {currentQuestionId == "q4" ? (
              <div className="flex w-full justify-center items-center mb-[20px]">
                <div className="inline-block min-w-[70px] px-[20px] py-[10px] border-none rounded text-[16px] text-white bg-[linear-gradient(30deg,_rgb(38,_186,_153),_rgb(38,_186,_153))]">
                  <span>{currentQuestion?.question}</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col text-[16px] font-extrabold text-[#2f2f2f] text-justify p-[16px] mb-[15px]">
                {currentQuestionId == "q1" && <span>KÍNH CHÀO QUÝ KHÁCH</span>}
                <span>{currentQuestion?.question}</span>
              </div>
            )}
            {currentQuestion?.type === "CHOOSE" && (
              <div className="flex flex-col p-[16px] gap-[10px]">
                {showError && (
                  <div className="flex w-full items-center justify-center">
                    <div className="text-white bg-[#f44336] px-[12px] py-[7px] rounded-[4px] mb-[20px] text-center text-[14px]">
                      Câu hỏi này chưa được trả lời
                    </div>
                  </div>
                )}
                {currentQuestion.options?.map((opt) => {
                  const isSelected = answers[currentQuestionId] === opt.value;
                  return (
                    <div
                      key={opt.value}
                      className={`flex items-center cursor-pointer min-h-[42px] py-[7px] px-[14px] rounded-[2px] border transition-transform duration-300 hover:scale-x-[1.01] hover:scale-y-[1.02] ${
                        (selected ? selected === opt.value : isSelected)
                          ? "border-transparent text-white bg-[linear-gradient(30deg,_rgb(124,_169,_188),_rgb(124,_169,_188))]"
                          : "bg-white text-black border-gray-400 hover:bg-blue-50"
                      }`}
                      onClick={() => {
                        setShowError(false);
                        setSelected(opt.value);
                      }}
                    >
                      <div className="flex items-center h-full">
                        {opt.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {currentQuestion?.type === "TEXT" && (
              <div className="mb-[20px] p-[16px]">
                {showError && (
                  <div className="flex w-full items-center justify-center">
                    <div className="text-white bg-[#f44336] px-[12px] py-[7px] rounded-[4px] mb-[20px] text-center text-[14px]">
                      Câu hỏi này chưa được trả lời
                    </div>
                  </div>
                )}
                <Input.TextArea
                  rows={4}
                  ref={textareaRef}
                  value={answers[currentQuestionId] || ""}
                  onChange={(e) => {
                    if (e.target.value) {
                      setShowError(false);
                    }
                    setAnswers({
                      ...answers,
                      [currentQuestionId]: e.target.value,
                    });
                  }}
                  placeholder="Vui lòng nhập tại đây"
                />
              </div>
            )}

            {currentQuestion?.type === "FORM" && (
              <Form
                form={form}
                layout="vertical"
                initialValues={answers[currentQuestionId]}
              >
                <Form.Item
                  label="Họ và tên (bắt buộc)"
                  name="name"
                  required={false}
                  rules={[
                    {
                      required: true,
                      message: "Câu hỏi này chưa được trả lời",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Số điện thoại (bắt buộc)"
                  name="phone"
                  required={false}
                  rules={[
                    {
                      required: true,
                      message: "Câu hỏi này chưa được trả lời",
                    },
                    {
                      pattern: /^(\+?\d[\d\s\-]{7,14})$/,
                      message: "Số điện thoại không hợp lệ",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[{ type: "email" }]}
                >
                  <Input />
                </Form.Item>
              </Form>
            )}

            <div className="flex justify-center gap-[20px]">
              {currentStep !== 0 && (
                <div
                  className={`flex items-center gap-2 cursor-pointer py-[7px] px-[14px] rounded-[4px] border hover:bg-[#efefef] group`}
                  onClick={handleBack}
                >
                  <div className="translate-x-0 flex group-hover:-translate-x-1 transition-all duration-300 ease-in-out">
                    <ArrowLeftOutlined />
                  </div>
                  <span>Quay lại</span>
                </div>
              )}
              {currentStep === 3 ? (
                <div
                  className={`flex items-center gap-2 cursor-pointer py-[7px] px-[14px] rounded-[4px] border transition-all duration-300 ${
                    nameValue && phoneValue
                      ? "group border-transparent text-white bg-[linear-gradient(30deg,_rgb(124,_169,_188),_rgb(124,_169,_188))]"
                      : "bg-white text-black border-gray-400 hover:bg-blue-50"
                  }`}
                  onClick={async () => {
                    try {
                      const valueForm = await form.validateFields();
                      handleFormFinish(valueForm);
                    } catch (e) {
                      console.log(e);
                    }
                  }}
                >
                  <span>Xác nhận</span>

                  <div className="flex group-hover:scale-[1.2] transition-all duration-300">
                    <CheckOutlined />
                  </div>
                </div>
              ) : (
                <div
                  className={`flex items-center gap-2 cursor-pointer py-[7px] px-[14px] rounded-[4px] border transition-all duration-300 ${
                    ((currentQuestionId == "q1" || currentQuestionId == "q2") &&
                      (selected || answers[currentQuestionId])) ||
                    (currentQuestionId == "q3" && answers[currentQuestionId])
                      ? "group border-transparent text-white bg-[linear-gradient(30deg,_rgb(124,_169,_188),_rgb(124,_169,_188))]"
                      : "bg-white text-black border-gray-400 hover:bg-blue-50"
                  }`}
                  onClick={handleNext}
                >
                  <span>Tiếp tục</span>

                  <div className="translate-x-0 flex group-hover:translate-x-1 transition-all duration-300 ease-in-out">
                    <ArrowRightOutlined />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {!showFinishReview && (
          <div className="flex flex-col items-center absolute left-0 bottom-0 w-full transition-all duration-500 ease-in-out">
            <div className="w-16 h-8 leading-8 text-center text-white rounded-[2px] bg-[linear-gradient(30deg,_rgb(124,_169,_188),_rgb(124,_169,_188))]">
              {currentStepProgress}/{stepProgress}
            </div>

            <Progress
              percent={percent}
              showInfo={false}
              strokeColor="#7ca9bc"
              trailColor="#e0e0e0"
              className="w-[200px] mt-2 transition-all duration-500"
              rootClassName="abc"
            />
          </div>
        )}
      </div>
    </div>
  );
};
