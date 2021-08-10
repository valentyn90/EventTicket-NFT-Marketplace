import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
const FormData = require('form-data')

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  let img = req.body.file
  let data = img.replace(/^data:image\/\w+;base64,/, "")

  const fd = new FormData()
  fd.append('image.base64', data)
  fd.append('format', 'result')
  fd.append('test', 'true')
  fd.append('fit.toResult', 'true')

  const res2 = await axios.post(
    "https://clippingmagic.com/api/v1/images",
    fd,
    {
      headers: fd.getHeaders()
      ,
      auth: {
        username: process.env.NEXT_PUBLIC_CLIPPING_MAGIC_ID as string,
        password: process.env.NEXT_PUBLIC_CLIPPING_MAGIC_KEY as string,
      },
      responseType: 'arraybuffer',
    })
    .then(function (resp) {
      var base64data = 'data:image/png;base64, ' + Buffer.from(resp.data, 'binary').toString('base64')
      res.send(base64data)

    })
    .catch(function (error) {
      // console.log(error.response)
    })

}
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '100mb',
    },
  },
}
