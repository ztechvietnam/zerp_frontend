/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Drawer, FormProps } from "antd";
import { Dictionary } from "lodash";
import React, { forwardRef, useEffect, useState } from "react";

export interface FilterPanelProps extends FormProps {
  children?: React.ReactNode;
  label?: string;
  title?: string;
  showFilter?: boolean;
  searchFunc: (values: Dictionary<any>) => void;
  searchForm: (form: any) => React.ReactNode;
  values?: any;
}

const FilterPanel = forwardRef<HTMLDivElement, FilterPanelProps>(
  (
    {
      children,
      form,
      label,
      title,
      showFilter: showFilterProp,
      searchFunc,
      searchForm,
      values,
    },
    ref
  ) => {
    const [showFilter, setShowFilter] = useState<boolean>(false);
    const [formRendered, setFormRendered] = useState<boolean>(false);

    useEffect(() => {
      if (values && formRendered) {
        form!.setFieldsValue(values);
      }
    }, [values]);

    useEffect(() => {
      setShowFilter(showFilterProp || false);
    }, [showFilterProp]);

    const resetFilterPanel = async () => {
      form!.resetFields();
      try {
        const values = await form!.validateFields();
        searchFunc(values);
      } catch (error) {
        console.log(error);
      }
    };

    const handleOpenFilter = async () => {
      setShowFilter(true);
      setFormRendered(true);
      form!.setFieldsValue(values);
    };

    const handleSearch = async () => {
      setShowFilter(false);
      try {
        const values = await form!.validateFields();
        searchFunc(values);
      } catch (error) {
        console.log(error);
      }
    };

    const handleReset = () => {
      setShowFilter(false);
      resetFilterPanel();
    };

    return (
      <div className="inline-block">
        <div></div>
        <Drawer
          title={<div>{title || "Filter Criteria"}</div>}
          placement="right"
          width={350}
          mask
          onClose={() => setShowFilter(false)}
          closable
          open={showFilter}
        >
          <div onClick={handleOpenFilter}>
            <span className="flex items-center text-amber-500 hover:underline cursor-pointer">
              <svg
                className="mr-2"
                width="14"
                height="15"
                viewBox="0 0 14 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12.6602 0.75H1.3125C0.136719 0.75 -0.464844 2.17188 0.382812 2.99219L4.8125 7.42188V12.125C4.8125 12.5625 5.00391 12.9453 5.33203 13.2188L7.08203 14.5312C7.92969 15.1055 9.1875 14.5586 9.1875 13.4648V7.42188L13.5898 2.99219C14.4375 2.17188 13.8359 0.75 12.6602 0.75ZM7.875 6.875V13.4375L6.125 12.125V6.875L1.3125 2.0625H12.6875L7.875 6.875Z"
                  fill="#FFA940"
                />
              </svg>
              {label || "Filter"}
            </span>
          </div>
          <div className="flex flex-col gap-6">
            {searchForm(form)}
            <div className="flex gap-4">
              <Button
                type="primary"
                icon="search"
                size="large"
                onClick={handleSearch}
              >
                Tìm kiếm
              </Button>
              <Button size="large" onClick={handleReset}>
                Đặt lại
              </Button>
            </div>
          </div>
        </Drawer>
      </div>
    );
  }
);

export default React.memo(FilterPanel);
