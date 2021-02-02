import { resolve } from 'dns';
import XLSX from 'xlsx';

export const importExcel = (e_target: any) => new Promise((resolve: (value: any) => void) => {
    let wb;// 读取完成的数据  
    // 导入 

    if (!e_target.files) {
        resolve(false);
    }
    const firstfile = e_target.files[0];

    //文件读取   
    const reader = new FileReader();
    reader.onload = function (e: any) {
        const data = e.target.result;
        //将文件读取为二进制字符串  
        wb = XLSX.read(data, { type: 'binary' });


        // console.log(wb.SheetNames[0]);// wb.SheetNames[0]是获取Sheets中第一个Sheet的名字
        // wb.Sheets[Sheet名]获取第一个Sheet的数据

        let josonarray = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]])


        if (josonarray) {


            josonarray = josonarray.map((item: any) => {
                if (item["编号"] && item["姓名"]) {

                    return { usercode: item["编号"], username: item["姓名"] }
                }
            });
            // console.log(JSON.stringify(josonarray));

            resolve(josonarray);
        } else {
            resolve(false);
        }

    };
    reader.readAsBinaryString(firstfile);
})






export const exportExcel = (export_json: any) => {




    let SheetNames_array: any = [];
    Object.keys(export_json).map((awardlevel: any) => {
        SheetNames_array.push(awardlevel)
        export_json[awardlevel] = export_json[awardlevel].map((item: any) => ({ "编号": item.usercode, "姓名": item.username }))
        export_json[awardlevel] = XLSX.utils.json_to_sheet(export_json[awardlevel]);
    })
    const wb = { SheetNames: SheetNames_array, Sheets: export_json, Props: {} };


    const str = XLSX.write(wb, {
        bookType: 'xlsx', // 输出的文件类型
        type: 'buffer', // 输出的数据类型
        compression: true // 开启zip压缩
    });

    const buffer = new ArrayBuffer(str.length);
    let view = new Uint8Array(buffer);
    for (var i = 0; i != str.length; ++i) view[i] = str.charCodeAt(i) & 0xFF;

    const e = document.createElement('a');
    e.download = "中奖结果.xlsx";
    e.style.display = 'none';

    var blob = new Blob([buffer], { type: "application/octet-stream" });
    e.href = URL.createObjectURL(blob);

    document.body.appendChild(e);

    e.click();

    document.body.removeChild(e);
}

