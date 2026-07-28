import { Link } from 'react-router-dom'
import { ArrowRight, Upload, FolderOpen, CheckCircle, AlertCircle, Layers } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function UploadingDocumentsPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Uploading Documents' },
        ]}
        title="Uploading Documents"
        description="Add files to your knowledge base using drag-and-drop, the file picker, or bulk upload."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Convio makes it easy to add documents to your knowledge base. Upload files individually, drag multiple files at once, or use the file picker to select a batch.
      </p>

      <h2 id="upload-methods">Upload Methods</h2>

      <h3 id="drag-and-drop">Drag and Drop</h3>
      <p>
        The quickest way to upload. Open your knowledge base, go to the <strong>Documents</strong> tab, and drag files directly into the upload zone. The zone highlights when files are hovering over it.
      </p>
      <ul>
        <li>Supports dragging multiple files simultaneously</li>
        <li>Works with files from your desktop, file manager, or browser downloads</li>
        <li>Validates file types immediately — unsupported files show an error</li>
      </ul>

      <h3 id="file-picker">File Picker</h3>
      <p>
        Click <strong>Upload Files</strong> or the <strong>+</strong> button in the upload zone to open your system's file picker. Navigate to your files, select one or more, and click <strong>Open</strong>.
      </p>

      <DocCallout variant="tip" icon={FolderOpen} title="Selecting multiple files">
        Hold <strong>Ctrl</strong> (Windows) or <strong>Cmd</strong> (Mac) to select multiple files. You can also hold <strong>Shift</strong> to select a range.
      </DocCallout>

      <h3 id="bulk-upload">Bulk Upload</h3>
      <p>
        For large collections of documents, use bulk upload to add up to 20 files in a single operation. All files are validated, queued, and processed in parallel.
      </p>

      <h2 id="upload-flow">Upload Flow</h2>
      <p>
        When you upload files, Convio follows this process:
      </p>
      <ol>
        <li><strong>Validation:</strong> File type and size are checked. Invalid files are rejected immediately with a clear error message.</li>
        <li><strong>Upload:</strong> Valid files are uploaded to Convio's secure storage. A progress bar shows upload status per file.</li>
        <li><strong>Queued:</strong> Uploaded files enter the processing queue. You can continue working — processing happens in the background.</li>
        <li><strong>Processing:</strong> Text is extracted, content is chunked, and embeddings are generated. See <Link to="/docs/document-processing" className="text-primary hover:underline">Document Processing</Link> for details.</li>
        <li><strong>Ready:</strong> Once processing completes, the document status changes to "Ready" and the agent can retrieve its content.</li>
      </ol>

      <h2 id="progress-tracking">Progress Tracking</h2>
      <p>
        Each document shows a status indicator in the documents list:
      </p>

      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Upload}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="Uploading"
          description="The file is being transferred to Convio's servers. Progress percentage is displayed."
          href="#"
        />
        <DocFeatureCard
          icon={Layers}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="Processing"
          description="Text extraction and embedding generation are in progress. Large files may take a few minutes."
          href="#"
        />
        <DocFeatureCard
          icon={CheckCircle}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Ready"
          description="The document is fully indexed and available for retrieval. The agent can search its content."
          href="#"
        />
        <DocFeatureCard
          icon={AlertCircle}
          iconBg="bg-destructive/10"
          iconColor="text-destructive"
          title="Error"
          description="Processing failed. The error message explains what went wrong and how to fix it."
          href="#"
        />
      </DocCardGrid>

      <h2 id="file-limits">File Limits</h2>
      <ul>
        <li><strong>Max file size:</strong> 50 MB per file</li>
        <li><strong>Files per upload:</strong> 20 files</li>
        <li><strong>Accepted types:</strong> PDF, TXT, MD, CSV, JSON</li>
      </ul>

      <DocCallout variant="warning" icon={AlertCircle} title="Scanned PDFs">
        Scanned PDFs (image-based) have limited text extraction. If your PDF is a scanned document, consider running OCR software before uploading, or convert it to text first.
      </DocCallout>

      <h2 id="supported-encodings">Supported Encodings</h2>
      <p>
        Convio expects <strong>UTF-8</strong> encoded text files. This is the default encoding for most modern applications. If your file uses a legacy encoding (ISO-8859-1, Shift-JIS, etc.), convert it to UTF-8 before uploading.
      </p>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Layers}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Document Processing"
          href="/docs/document-processing"
        />
        <DocNextStepCard
          icon={AlertCircle}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Document Statuses"
          href="/docs/document-statuses"
        />
      </DocCardGrid>
    </DocContent>
  )
}
