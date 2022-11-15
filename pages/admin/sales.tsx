import { Heading, VStack } from "@chakra-ui/react"
import { AgGridReact } from "ag-grid-react"
import { useEffect, useMemo, useRef, useState } from "react";
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { useRouter } from "next/router";
import { supabase } from "@/supabase/supabase-client";
import _ from "lodash";

function currencyFormatter(currency:number, sign: string) {
    var sansDec = currency.toFixed(0);
    var formatted = sansDec.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return sign + `${formatted}`;
  }

const Sales = () => {

    const gridRef = useRef<AgGridReact>(null);

    const [totalSales, setTotalSales] = useState(0);
    const [totalOrders, setTotalOrders] = useState(0);
    const [totalCards, setTotalCards] = useState(0);

    const [rawData, setRawData] = useState<any>([]);
    const [pivotedData, setPivotedData] = useState<any>();

    const [columnDefs, setColumnDefs] = useState([
        // { field: 'created_at', type: 'dateColumn', filter: true },
        { field: 'player_name' },
        { field: 'total_sales', sort: 'desc', valueFormatter: (params: { value:any }) => currencyFormatter(params.value, '$'), },
        { field: 'total_quantity' },
        { field: 'school' },
    ]);

    const router = useRouter();
    const defaultColDef = useMemo(() => ({
        sortable: true,
        filter: true
    }), []);

    function onFirstDataRendered(params: any) {
        params.api.sizeColumnsToFit();
    }

    useEffect(() => {
        if (router) {
            // fetch('/api/admin/get-items-to-ship?item=' + item)
            //     .then(result => result.json())
            //     .then(data => setPi(data.full_data));
            // // .then(rowData => setRowData(rowData))

            supabase.from('drop_credit_card_sale')
                .select('created_at, price_usd, quantity, drop (player_name, nft!drop_premium_nft_fkey(high_school))')
                .eq('status', '4_nfts_assigned')
                .then(({ data, error }) => {
                    console.log(data || error);
                    setRawData(data);
                })
        }

    }, [router]);

    useEffect(() => {

        if (rawData) {
            console.log("asdfas")
            // aggregate total sales and quantity for each player_name
            const agg = _(rawData)
                .groupBy('drop.player_name')
                .map((objs, key) => ({
                    'player_name': key,
                    'total_sales': _.sumBy(objs, function (o) { return o.price_usd * o.quantity; }),
                    'total_quantity': _.sumBy(objs, 'quantity'),
                    'school': objs[0].drop.nft.high_school
                }))
                .value()

            console.table(agg)

            setPivotedData(agg);

            
        }

    }, [rawData]);

    return (
        <VStack>
            {/* <Heading>{totalOrders} Orders | {totalCards} Cards | {totalSales} Sales</Heading> */}
            <Heading>Raw Sales</Heading>

            {/* On div wrapping Grid a) specify theme CSS Class Class and b) sets Grid size */}
            <div className="ag-theme-alpine" style={{ width: "90%", height: "70vh" }}>

                <AgGridReact
                    ref={gridRef} // Ref for accessing Grid's API

                    rowData={pivotedData} // Row Data for Rows

                    //@ts-ignore
                    columnDefs={columnDefs} // Column Defs for Columns
                    defaultColDef={defaultColDef} // Default Column Properties

                    animateRows={true} // Optional - set to 'true' to have rows animate when sorted
                    rowSelection='multiple' // Options - allows click selection of rows
                    singleClickEdit={true} // Optional - set to 'true' to allow editing of cells on single click

                    // onCellClicked={cellClickedListener} // Optional - registering for Grid Event
                    // onCellValueChanged={saveState}

                    onFirstDataRendered={onFirstDataRendered}
                />
            </div>
        </VStack>

    )

}

export default Sales