import { getUploadApi } from '@/api/common'
import { ElLoading } from 'element-plus'
export default function useUpload() {
    return async function uploadFile(file) {
        const loading = ElLoading.service({
            lock: true,
            text: '',
            background: 'rgba(0, 0, 0, 0.7)',
        })

        // 获取后缀名
        const type = file.name.split('.').pop()
        const resp = await getUploadApi({
            mimetypes: type,
        })
        const uploadUrl = resp.upload_url ?? ''
        const filepath = resp.filepath ?? ''
        if (uploadUrl.length <= 0 || filepath.length <= 0) {
            return
        }

        const uploadRes = await fetch(uploadUrl, {
            method: 'PUT',
            body: file,
        })

        if (!uploadRes.ok) {
            return
        }
        loading.close()
        return filepath
    }
}
