import React, { useState, useRef, useEffect, useMemo, useCallback, forwardRef, useImperativeHandle } from 'react';
import { render } from 'react-dom';
import { AgGridReact } from 'ag-grid-react'; // the AG Grid React Component
import { CSVDownload } from "react-csv";
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
import { Button, Center, Heading, HStack, Radio, RadioGroup, useToast, VStack } from '@chakra-ui/react';
import { supabase } from '@/supabase/supabase-client';
import { setAriaDescribedBy } from 'ag-grid-community/dist/lib/utils/aria';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { NextApiRequest } from 'next';
import { getUserDetails } from '@/supabase/userDetails';





const Ship = () => {

    // AG Grid ref Type
    const gridRef = useRef<AgGridReact>(null);  // Optional - for accessing Grid's API
    const [rowData, setRowData] = useState<any>(); // Set rowData to Array of Objects, one Object per Row
    const [pivotedData, setPivotedData] = useState<any>(); // Set rowData to Array of Objects, one Object per Row

    const [arIds, setArIds] = useState<any>([]); // Set rowData to Array of Objects, one Object per Row
    const [arLoading, setArLoading] = useState(false); // Set rowData to Array of Objects, one Object per Row

    const [csvData, setCsvData] = useState<any>([]); // Set rowData to Array of Objects, one Object per Row

    const [arIdsSaved, setArIdsSaved] = useState(false); // Set rowData to Array of Objects, one Object per Row

    const [totalOrders, setTotalOrders] = useState(0); // Set rowData to Array of Objects, one Object per Row
    const [totalCards, setTotalCards] = useState(0); // Set rowData to Array of Objects, one Object per Row

    const toast = useToast();
    const router = useRouter();

    let { item } = router.query;

    if (!item) {
        item = "drop"
    }

    let order_table = "drop_credit_card_sale"
    let order_nft_table = "drop_nfts"

    if (item == "challenge") {
        order_table = "fan_challenge_orders"
        order_nft_table = "fan_challenge_nfts"
    }

    if (item == "ar") {
        order_table = "ar_credit_card_sale"
    }

    function toastResults(data: any, error: any, success_message: string = 'Success') {
        if (data) {
            toast(
                {
                    title: "Success",
                    position: "top",
                    description: success_message,
                    status: "success",
                    duration: 5000,
                }
            )
        }
        else {
            toast(
                {
                    title: `Error - ${error && error.message || 'unknown'}`,
                    position: "top",
                    description: error.details,
                    status: "error",
                    duration: 5000,
                }
            )
        }
    }

    // Each Column Definition results in one Column.
    const [columnDefs, setColumnDefs] = useState([
        { field: 'created_at', type: 'dateColumn' },
        { field: 'id', filter: true },
        { field: 'quantity', filter: true },
        { field: 'price_usd' },
        { field: 'ar_id', editable: true, type: 'numericColumn' },
        { field: 'contact.name', sort: 'asc' },
        { field: 'contact.street_1' },
        { field: 'nft_id' },
        { field: 'serial_no' },
        { field: 'contact.email' },
        { field: 'contact.city', hide: true },
        { field: 'contact.state', hide: true },
        { field: 'contact.zip', hide: true },
        { field: 'contact.street_2', hide: true },
    ]);

    // DefaultColDef sets props common to all Columns
    const defaultColDef = useMemo(() => ({
        sortable: true
    }), []);

    const saveState = useCallback(async (event) => {
        // console.log('stateSaved', event);

        if (event.value != event.old_value) {

            // ensure ar_id is valid
            const ar_id = parseInt(event.data.ar_id);

            if (arIds.includes(ar_id)) {
                toast({
                    title: "Error",
                    position: "top",
                    description: "AR ID already exists",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });

                event.node.setDataValue('ar_id', null);

                return;
            }

            //update ar_id in table
            if (item != "ar") {
                const { data, error } = await supabase.from(order_nft_table)
                    .update({ ar_id: parseInt(event.data.ar_id) })
                    .eq('id', event.data.drop_nft_id)
            }
        }

    }, [arIds]);

    // Example of consuming Grid Event
    // const cellClickedListener = useCallback(event => {
    //     console.log('cellClicked', event);
    // }, []);


    useEffect(() => {

        let pivoted_data = [] as any[];

        if (rowData) {
            // Pivot the object to have the order_nfts as the key
            rowData!.map((row: any) => {
                row.order_nfts.map((nft: any) => {
                    pivoted_data.push({
                        ...row,
                        nft_id: nft.nft_id,
                        serial_no: nft.serial_no,
                        ar_id: nft.ar_id,
                        drop_nft_id: nft.id,
                    })
                })

            })
            setTotalOrders(rowData.length);
        }

        setTotalCards(pivoted_data.length);
        setPivotedData(pivoted_data);
        // console.log(pivoted_data[0]);

    }, [rowData])


    // Example load data from sever
    useEffect(() => {
        if (router) {
            fetch('/api/admin/get-items-to-ship?item=' + item)
                .then(result => result.json())
                .then(data => setRowData(data.full_data));
            // .then(rowData => setRowData(rowData))

            supabase.from('ar_mapping').select('ar_id')
                .then(({ data, error }) => {
                    setArIds(data?.map((item: any) => { return item.ar_id }));
                })
        }

    }, [router]);

    // Example using Grid's API
    const saveArIds = useCallback(async (e) => {
        setArLoading(true);

        let updated_rows = [] as any[];

        gridRef.current!.api.forEachNode(
            (node: any) => {
                if (node.data.ar_id) {
                    updated_rows.push(node.data)
                }
            }
        );

        const insert_data = updated_rows.map((row: any) => {
            if (!arIds.includes(row.ar_id)) {

                return {
                    nft_id: row.nft_id,
                    ar_id: row.ar_id,
                    serial_no: row.serial_no,
                }

            }
            return null
        })

        const insert_filtered = insert_data.filter((item: any) => { return item != null })

        if (insert_filtered.length > 0) {
            const { data, error } = await supabase.from('ar_mapping')
                .insert(insert_filtered)
            if (data) {
                setArIdsSaved(true)
                toast(
                    {
                        title: "Success",
                        position: "top",
                        description: `${insert_filtered.length} AR IDs updated`,
                        status: "success",
                        duration: 5000,
                    }
                )
            }
            else {
                toast(
                    {
                        title: `Error - ${error && error.message || 'unknown'}`,
                        position: "top",
                        description: error && error.details,
                        status: "error",
                        duration: 5000,
                    }
                )
            }
        }
        else {
            setArIdsSaved(true)
            toast(
                {
                    title: "Success",
                    position: "top",
                    description: "No new AR IDs updated",
                    status: "success",
                    duration: 5000,
                }
            )
        }

        setArLoading(false);
        // gridRef.current!.api.deselectAll();
    }, [arIds]);

    const markAllAsShipped = useCallback(async (e) => {

        const assigned_nfts = pivotedData.filter((nft: any) => { return nft.ar_id != null || nft.nft_id === null })

        const drop_nft_ids = assigned_nfts.map((nft: any) => { return nft.drop_nft_id })

        const order_ids = assigned_nfts.map((nft: any) => { return nft.id })

        const unique_order_ids = [...new Set(order_ids)]

        if (drop_nft_ids.length > 0) {

            if (item == 'drop') {
                const { data, error } = await supabase.from('drop_nfts')
                    .update({ status: `shipped - ${(new Date).toDateString()}` })
                    .in('id', drop_nft_ids)

                toastResults(data, error, `Marked ${drop_nft_ids.length} NFTs as shipped`)
            }

            const { data: drop_cc, error: drop_cc_error } =
                await supabase.from(order_table)
                    .update({ shipped: (new Date).toDateString() })
                    .in('id', unique_order_ids)

            toastResults(drop_cc, drop_cc_error, `Marked ${unique_order_ids.length} orders as shipped`)
        }
        else {
            toast(
                {
                    title: "Error",
                    position: "top",
                    description: "Nothing to update",
                    status: "error",
                    duration: 5000,
                }
            )
        }



        // gridRef.current!.api.deselectAll();
    }, [pivotedData]);


    const onBtnExport = useCallback(() => {
        // const data = gridRef.current!.api.exportDataAsCsv(
        //     {
        //         fileName: 'nfts_to_ship',
        //         allColumns: true,
        //         columnKeys: ['contact.name','contact.street_1','contact.street_2','contact.city','contact.state','contact.zip'],
        //     }
        // );

        // Pull 
        const csv_data = pivotedData.map((nft: any) => {
            return {
                'contact.name': nft.contact.name,
                'contact.street_1': nft.contact.street_1,
                'contact.street_2': nft.contact.street_2,
                'contact.city': nft.contact.city,
                'contact.state': nft.contact.state,
                'contact.zip': nft.contact.zip,
            }
        })

        // get only unique entries

        const unique_data = [...new Set(csv_data.map((item: any) => { return JSON.stringify(item) }))].map((item: any) => { return JSON.parse(item) })

        // sort data by name
        unique_data.sort((a: any, b: any) => {
            if (a['contact.name'] < b['contact.name']) { return -1; }
            if (a['contact.name'] > b['contact.name']) { return 1; }
            return 0;
        })


        setCsvData(unique_data);

        // export to csv

    }, [pivotedData]);

    function onFirstDataRendered(params: any) {
        params.api.sizeColumnsToFit();
    }


    return (
        <VStack>
            <Heading>{totalOrders} Orders & {totalCards} Cards</Heading>
            <HStack gridGap={5}>
                <Link href={`/admin/ship?item=drop`}>Drop</Link>
                <Link href={`/admin/ship?item=challenge`}>Challenge</Link>
                <Link href={`/admin/ship?item=ar`}>AR</Link>

            </HStack>

            <HStack alignContent={"center"}>
                <Button onClick={onBtnExport}>Get Address CSV</Button>
                {csvData && csvData.length > 0 && <CSVDownload data={csvData} target="_blank" />};
                <Button onClick={saveArIds} loading={arLoading}>Save AR_Ids</Button>
                <Button onClick={markAllAsShipped} disabled={!arIdsSaved}>Mark Shipped</Button>
            </HStack>

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
                    onCellValueChanged={saveState}

                    onFirstDataRendered={onFirstDataRendered}
                />
            </div>
        </VStack>
    );


}

export async function getServerSideProps({ req }: { req: NextApiRequest }) {
    const { user } = await supabase.auth.api.getUserByCookie(req);
    if (!user) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    } else {
      const { data, error } = await getUserDetails(user.id);
  
      if (data?.role === process.env.NEXT_PUBLIC_ADMIN_ROLE) {
        return { props: {} };
      } else {
        return {
          redirect: {
            destination: "/",
            permanent: false,
          },
        };
      }
    }
  }
  

export default Ship