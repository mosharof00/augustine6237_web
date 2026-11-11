import { createColumnHelper } from "@tanstack/react-table";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DataTable, dataTableFeatures, type DataTableProps } from "./data-table";

type Row = { name: string };

const helper = createColumnHelper<typeof dataTableFeatures, Row>();
const columns = [
  helper.accessor("name", { header: "Name" }),
] as DataTableProps<Row>["columns"];

describe("DataTable footer", () => {
  it("prints Showing 1–12 of 80 and 1 / 7", () => {
    const html = renderToStaticMarkup(
      <DataTable
        columns={columns}
        data={[{ name: "Ada" }]}
        search=""
        onSearchChange={() => undefined}
        page={1}
        perPage={12}
        total={80}
        lastPage={7}
        onPageChange={() => undefined}
      />,
    );
    expect(html).toContain("Showing 1–12 of 80");
    expect(html).toContain("1 / 7");
  });
});
