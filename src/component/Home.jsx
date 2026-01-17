import React, { useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import Card from "./Card";
import { Paginator } from "primereact/paginator";
import ls from "localstorage-slim"; //for persistant storage we will store global selectedIds
import { number } from "zod";
import { OverlayPanel } from "primereact/overlaypanel";

import { Ripple } from "primereact/ripple";
import { classNames } from "primereact/utils";

const Home = () => {
  // 1. Initialize data as an empty array [] to prevent .filter errors
  const [data, setdata] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]); // This is your "Global Store" for IDs
  const [ms, setms] = useState(false);
  const [lookvalue, setlookvalue] = useState(0); //page row objects
  const [first, setFirst] = useState(0);
  const [fpgArray, setfpgArray] = useState([]);
  const [rows, setRows] = useState(12);
  const [rowClick, setRowClick] = useState(true);
  const op = useRef(null);
  const [totalPages, settotalPages] = useState(0)

  // data from API
  async function getData(page) {
    try {
      const result = await axios.get(
        `https://api.artic.edu/api/v1/artworks?page=${page}`
      );
      setdata(result.data.data || []);
      settotalPages(result.data.pagination.total)
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  //object page and rows return {pageNo:noOFRows}
  useEffect(() => {
    let noOfPages = Math.floor(lookvalue / 12);
    let noOfRows = lookvalue % 12;
    let pageCount = first / 12;
    let pgArr = [];
    while (noOfPages != 0) {
      pgArr.push({ [pageCount]: 12 });
      noOfPages--;
      pageCount++;
    }
    if (noOfRows != 0) {
      pgArr.push({ [pageCount]: noOfRows });
    }
    setfpgArray(pgArr); //saves object of pages and rows
    // setFirst(0); //as look value changes we direct to first page to use the select row feature
    // getData(first/12);
  }, [lookvalue]);

  //handle select group feature and invidual select feature together
  useEffect(() => {
    let targetObj = {};
    if (fpgArray.length !== 0) {
      const currentPage = first / 12;
      targetObj = fpgArray.find((obj) => currentPage in obj);

      if (targetObj) {
        const currentPageIds = data?.map((item) => item.id);
        const temp = currentPageIds.slice(0, targetObj[currentPage]);
        setSelectedIds((prev) => [...new Set([...prev, ...temp])]);
        setfpgArray((prev) => prev.filter((obj) => !(currentPage in obj)));
      }
    }
  }, [data]);

  const onPageChange = (event) => {
    setFirst(event.first);
    setRows(event.rows);
    getData(event.page + 1); //retrieve data
  };

  // 2. Derive objects for the table to show blue highlights/checkboxes
  // Only looks at the CURRENT page data to find matches from our master ID list
  const selectedObjects = useMemo(() => {
    return data.filter((item) => selectedIds.includes(item.id));
  }, [data, selectedIds]);

  // 3. The logic that maintains selection across pages
  const handleSelectionChange = (e) => {
    // IDs currently visible on this page
    const currentPageIds = data.map((item) => item.id);

    // IDs from OTHER pages (Keep these safe!)
    const otherPageIds = selectedIds.filter(
      (id) => !currentPageIds.includes(id)
    );

    // IDs currently selected on THIS page (from the table event)
    const currentPageSelectedIds = e.value.map((val) => val.id);

    // Merge them together
    const finalSelection = [...otherPageIds, ...currentPageSelectedIds];

    setSelectedIds(finalSelection);
    console.log("Master List of Selected IDs:", finalSelection);
  };
  const template1 = {
    layout:
      "PrevPageLink PageLinks NextPageLink RowsPerPageDropdown",
    PrevPageLink: (options) => {
      return (
        <button
          type="button"
          className={classNames(options.className, "border-round")}
          onClick={options.onClick}
          disabled={options.disabled}
        >
          <span className="p-3">Previous</span>
          <Ripple />
        </button>
      );
    },
    NextPageLink: (options) => {
      return (
        <button
          type="button"
          className={classNames(options.className, "border-round")}
          onClick={options.onClick}
          disabled={options.disabled}
        >
          <span className="p-3">Next</span>
          <Ripple />
        </button>
      );
    },
    PageLinks: (options) => {
      if (
        (options.view.startPage === options.page &&
          options.view.startPage !== 0) ||
        (options.view.endPage === options.page &&
          options.page + 1 !== options.totalPages)
      ) {
        const className = classNames(options.className, { "p-disabled": true });

        return (
          <span className={className} style={{ userSelect: "none" }}>
            ...
          </span>
        );
      }

      return (
        <button
          type="button"
          className={options.className}
          onClick={options.onClick}
        >
          {options.page + 1}
          <Ripple />
        </button>
      );
    },
  };

  return (
    <>
      <div className="p-4">
        <h2>Artworks Home</h2>
        <div className="mb-2">
          Total Selected: <strong>{selectedIds.length}</strong> items
        </div>

        {/* 
                For testing arrays and Ids
                
                <Button label="Log Selected IDs" icon="pi pi-search" onClick={() => {
                    console.log("Selected IDs State:", selectedIds,fpgArray);
                }} /> */}

        <div className="relative mt-4">
          {/* {ms && <Card lookvalue={lookvalue} setlookvalue={setlookvalue} className="absolute z-100" />} */}

          <OverlayPanel ref={op} showCloseIcon>
            <Card lookvalue={lookvalue} setlookvalue={setlookvalue} />
          </OverlayPanel>
          <DataTable
            value={data}
            stripedRows
            selectionMode={rowClick ? null : "checkbox"}
            selection={selectedObjects}
            onSelectionChange={handleSelectionChange}
            className="overflow-visible"
            dataKey="id"
            tableStyle={{ minWidth: "50rem" }}
          >
            <Column
              selectionMode="multiple"
              header={
                <i
                  className="pi pi-angle-down"
                  style={{ color: "slateblue", cursor: "pointer" }}
                  onClick={(e) => op.current.toggle(e)}
                >
                  {" "}
                  {/* 3. Fixed: Pass 'e' to toggle */}
                </i>
              }
              headerStyle={{ width: "3rem" }}
            />

            <Column field="id" header="Id"></Column>
            <Column
              field="title"
              header="Title"
              body={(rowData) => rowData.title || "N/A"}
            ></Column>
            <Column
              field="place_of_origin"
              header="Origin"
              body={(rowData) => rowData.place_of_origin || "N/A"}
            ></Column>
            <Column
              field="artist_display"
              header="Artist"
              body={(rowData) => rowData.artist_display || "N/A"}
            ></Column>
            <Column
              field="date_start"
              header="Start Date"
              body={(rowData) => rowData.date_start || "N/A"}
            ></Column>
            <Column
              field="date_end"
              header="End Date"
              body={(rowData) => rowData.date_end || "N/A"}
            ></Column>
          </DataTable>

          <div className="flex justify-between items-center mt-4">
            {/* Left Side: Summary Text */}
            <div className="text-sm text-gray-600">
              Showing {first + 1} to{" "}
              {Math.min(first + rows, totalPages)} of{" "}
              {totalPages} entries
            </div>

            {/* Right Side: Paginator */}
            <Paginator
              template={template1}
              first={first}
              rows={rows}
              totalRecords={totalPages}
              onPageChange={onPageChange}
              className="p-0 border-none bg-transparent" // Removes default padding/bg that might offset alignment
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
