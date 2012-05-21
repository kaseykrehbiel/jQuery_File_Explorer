<%
Option Explicit

' Set the File Explorer's options below class declarations

Function fIf(x, y, z)
   If x Then fIf = y Else fIf = z
End Function

Function fByteSize(n)
   If n < 1024 Then
      n = n & "B"
   ElseIf n < 1048576 Then
      n = Round(n / 1024, 1) & "KB"
   ElseIf n < 1073741824 Then
      n = Round(n / 1048576, 1) & "MB"
   ElseIf n < 1099511627775 Then
      n = Round(n / 1073741824, 1) & "GB"
   Else
      n = "RBN!"
   End If
   fByteSize = n
End Function

Class FileExplorerOptions
   Private m_root
   Private m_fileTypes
   Private m_toolbar
   Private m_displayRoot
   Private m_actOnRoot
   Private m_actionEvent
   Private m_waitPrompt
   Private m_showFileSize
   Private m_showFileDate
   Private m_createRoot
   
   Public Property Get Root() Root = m_root End Property
   Public Property Let Root(value) m_root = value End Property
   Public Property Get Script() Script = Request.ServerVariables("URL") End Property
   Public Property Get FileTypes() FileTypes = m_fileTypes End Property
   Public Property Let FileTypes(value) m_fileTypes = value End Property
   Public Property Get Toolbar() Set Toolbar = m_toolbar End Property
   Public Property Get DisplayRoot() DisplayRoot = m_displayRoot End Property
   Public Property Let DisplayRoot(value) m_displayRoot = value End Property
   Public Property Get ActOnRoot() ActOnRoot = m_actOnRoot End Property
   Public Property Let ActOnRoot(value) m_actOnRoot = value End Property
   Public Property Get ActionEvent() ActionEvent = m_actionEvent End Property
   Public Property Let ActionEvent(value) m_actionEvent = value End Property
   Public Property Get WaitPrompt() WaitPrompt = m_waitPrompt End Property
   Public Property Let WaitPrompt(value) m_waitPrompt = value End Property
   Public Property Get ShowFileSize() ShowFileSize = m_showFileSize End Property
   Public Property Let ShowFileSize(value) m_showFileSize = value End Property
   Public Property Get ShowFileDate() ShowFileDate = m_showFileDate End Property
   Public Property Let ShowFileDate(value) m_showFileDate = value End Property
   Public Property Get CreateRoot() CreateRoot = m_createRoot End Property
   Public Property Let CreateRoot(value) m_createRoot = value End Property
   
   Private Sub Class_Initialize()
      m_fileTypes = "jpg, gif, pdf, xls, ppt, doc, txt, xml, html, htm, pptx, docx, xlsx, kml, kmz"
      m_displayRoot = False
      m_actOnRoot = False
      m_actionEvent = "dblclick"
      m_waitPrompt = "Please Wait..."
      m_showFileSize = False
      m_showFileDate = False
      m_createRoot = False
      Set m_toolbar = new FileExplorerToolbar
   End Sub
   
End Class

Class FileExplorerToolbar
   Private m_enabled
   Private m_createFolder
   Private m_deleteFolder
   Private m_uploadFile
   Private m_uploadMaxSize
   Private m_deleteFile
   
   Private Sub Class_Initialize()
      m_enabled = False
      m_createFolder = False
      m_deleteFolder = False
      m_uploadFile = False
      m_uploadMaxSize = 5242880
      m_deleteFile = False
   End Sub
   
   Public Property Get Enabled() Enabled = m_enabled End Property
   Public Property Let Enabled(value) m_enabled = value End Property
   Public Property Get CreateFolder() CreateFolder = m_createFolder End Property
   Public Property Let CreateFolder(value) m_createFolder = value End Property
   Public Property Get DeleteFolder() DeleteFolder = m_deleteFolder End Property
   Public Property Let DeleteFolder(value) m_deleteFolder = value End Property
   Public Property Get UploadFile() UploadFile = m_uploadFile End Property
   Public Property Let UploadFile(value) m_uploadFile = value End Property
   Public Property Get UploadMaxSize() UploadMaxSize = m_uploadMaxSize End Property
   Public Property Let UploadMaxSize(value) m_uploadMaxSize = value End Property
   Public Property Get DeleteFile() DeleteFile = m_deleteFile End Property
   Public Property Let DeleteFile(value) m_deleteFile = value End Property
End Class

Dim jqfeOptions, jqfeOptionsJSON
Set jqfeOptions = New FileExplorerOptions

' This is where to set File Explorer options

jqfeOptions.Root = "/test"
'jqfeOptions.FileTypes = 'jpg, gif'
jqfeOptions.Toolbar.Enabled = True
jqfeOptions.Toolbar.CreateFolder = True
jqfeOptions.Toolbar.DeleteFolder = True
jqfeOptions.Toolbar.UploadFile = True
'jqfeOptions.UploadMaxSize = 1024
jqfeOptions.Toolbar.DeleteFile = True
jqfeOptions.DisplayRoot = True
jqfeOptions.ActOnRoot = False
'jqfeOptions.ActionEvent = "click"
jqfeOptions.showFileSize = True
'jqfeOptions.ShowFileDate = True
'jqfeOptions.CreateRoot = True

jqfeOptionsJSON = "{root: '" & jqfeOptions.Root & "',script: '" & jqfeOptions.Script & "',fileTypes: '" & jqfeOptions.FileTypes & "',toolbar: {enabled: " & fIf(jqfeOptions.Toolbar.Enabled, "true", "false") & ",createFolder: " & fIf(jqfeOptions.Toolbar.CreateFolder, "true", "false") & ",deleteFolder: " & fIf(jqfeOptions.Toolbar.DeleteFolder, "true", "false") & ",uploadFile: " & fIf(jqfeOptions.Toolbar.UploadFile, "true", "false") & ",uploadMaxSize: 5242880,deleteFile: " & fIf(jqfeOptions.Toolbar.DeleteFile, "true", "false") & "},displayRoot: " & fIf(jqfeOptions.DisplayRoot, "true", "false") & ",actOnRoot: " & fIf(jqfeOptions.ActOnRoot, "true", "false") & ",actionEvent: 'dblclick',waitPrompt: 'Please Wait...',showFileSize: " & fIf(jqfeOptions.ShowFileSize, "true", "false") & ",showFileDate: " & fIf(jqfeOptions.ShowFileDate, "true", "false") & ",createRoot: " & fIf(jqfeOptions.CreateRoot, "true", "false") & "}"

Dim sDir, sBaseDir, oFS, oFolder, oSubFolder, oFile, sExt, sNewFolder, sName, sFile, oUpload, sAction, sError
Set oFS = Server.CreateObject("Scripting.FileSystemObject")
If Request("location") = "" Then
   Set oUpload = Server.CreateObject("Persits.Upload")
   oUpload.SaveToMemory
   sAction = oUpload.Form("jqfeAction")
Else
   sAction = Request("jqfeAction")
End If
sError = ""
Select Case sAction
   Case "getoptions":
      Response.Write jqfeOptionsJSON
   Case "createfolder": ' Create Folder
      If jqfeOptions.Toolbar.CreateFolder Then
         sDir = Replace(Request("location"), "%20", " ")
         sNewFolder = Request("newfolder")
         If Len(sDir) = 0 Then sBaseDir = Server.MapPath("/") Else sBaseDir = Server.MapPath(sDir) & "\"
         If Not(oFS.FolderExists(sBaseDir)) Then 
            sError = "Folder does not exist: " & sDir
         Else
            If Not(oFS.FolderExists(Server.MapPath(sDir) & "\" & sNewFolder)) Then
               oFS.CreateFolder(Server.MapPath(sDir) & "\" & sNewFolder)
            Else
               sError = "Folder already exists: " & sDir & sNewFolder
            End If
         End If
      Else
         sError = "You are not permitted to create a folder."
      End If
   Case "deletefolder": ' Delete Folder
      If jqfeOptions.Toolbar.DeleteFolder Then
         sDir = Replace(Request("location"), "%20", " ")
         If Len(sDir) = 0 Then sBaseDir = Server.MapPath("/") Else sBaseDir = Server.MapPath(sDir) & "\"
         If Not(oFS.FolderExists(sBaseDir)) Then 
            sError = "Folder does not exist: " & sDir
         Else
            If oFS.GetFolder(Server.MapPath(sDir)).Files.Count = 0 And oFS.GetFolder(Server.MapPath(sDir)).SubFolders.Count = 0 Then
               oFS.DeleteFolder(Server.MapPath(sDir))
            Else
               sError = "Folder is not empty: " & sDir
            End If
         End If
      Else
         sError = "You are not permitted to delete folders."
      End If
   Case "deletefile":
      If jqfeOptions.Toolbar.DeleteFile Then
         sDir = Replace(Request("location"), "%20", " ")
         If Len(sDir) = 0 Then
            sError = "File does not exist: " & sDir
         Else
            If Not oFS.FileExists(Server.MapPath(sDir)) Then
               sError = "File does not exist: " & sDir
            Else
               oFS.DeleteFile(Server.MapPath(sDir))
            End If
         End If
      Else
         sError = "You are not permitted to delete files."
      End If
   Case "upload":
      If jqfeOptions.Toolbar.UploadFile Then
         sError = ""
         sDir = Replace(oUpload.Form("location"), "%20", " ")
         If Len(sDir) = 0 Then
            sError = "Folder does not exist."
         Else
            For Each oFile In oUpload.Files
               If oFS.FileExists(Server.MapPath(sDir) & "\" & oFile.FileName) Then
                  sError = "File already exists: " & oFile.FileName
               Else
                  sExt = Right(oFile.FileName, Len(oFile.FileName) - InStrRev(oFile.FileName, "."))
                  If InStr(jqfeOptions.FileTypes, sExt) Then
                     oFile.SaveAs(Server.MapPath(sDir) & "\" & oFile.FileName)
                     Response.Write "{ size: """ & fByteSize(oFile.Size) & """, date: """ & Now & """ }"
                  Else
                     sError = "You may only upload these file types: " & jqfeOptions.FileTypes
                  End If
               End If
            Next
         End If
      Else
         sError = "You are not permitted to upload files."
      End If
   Case "renamefile":
      If jqfeOptions.Toolbar.DeleteFile Then
         sDir = Replace(Request("location"), "%20", " ")
         If Len(sDir) = 0 Then
            sError = "File does not exist: " & sDir
         Else
            If Not(oFS.FolderExists(Server.MapPath(Request("parentlocation")))) Then
               sError = "Folder does not exist: " & sDir
            Else
               If oFS.FileExists(Server.MapPath(sDir)) Then
                  If oFS.FileExists(Server.MapPath(Request("parentlocation") & Request("newname"))) Then
                     sError = "Filename already exists: " & Request("newname")
                  Else
                     Set oFile = oFS.GetFile(Server.MapPath(sDir))
                     sExt = Right(sDir, Len(sDir) - InStrRev(sDir, "."))
                     oFile.Name = Request("newname") & "." & sExt
                     Set oFile = Nothing
                  End If
               Else
                  sError = "File does not exist: " & sDir
               End If
            End If
         End If
      Else
         sError = "You are not permitted to rename files."
      End If
   Case "renamefolder":
      If jqfeOptions.Toolbar.DeleteFolder Then
         sDir = Replace(Request("location"), "%20", " ")
         If Len(sDir) = 0 Then
            sError = "Folder does not exist: " & sDir
         Else
            If oFS.FolderExists(Server.MapPath(sDir)) Then
               If oFS.FolderExists(Server.MapPath(Request("parentlocation") & Request("newname"))) Then
                  sError = "Folder name already exists: " & Request("newname")
               Else
                  oFS.MoveFolder Server.MapPath(sDir), Server.MapPath(Request("parentlocation") & "/" & Request("newname"))
               End If
            End If
         End If
      Else
         sError = "You are not permitted to rename folders."
      End If
   Case Else: ' Display File List
      sDir = Replace(Request("location"), "%20", " ")
      If Not(Len(sDir) = 0) Then
         If Instr(sDir, jqfeOptions.Root) Then
            sBaseDir = Server.MapPath(sDir) & "\"
            If Not(oFS.FolderExists(sBaseDir)) Then 
              sError = "Folder does not exist: " & sDir
            Else
               %>
               <ul class="jqfeList">
                  <%
                     Set oFolder = oFS.GetFolder(sBaseDir)
                     For Each oSubFolder In oFolder.SubFolders
                        sName = oSubFolder.Name
                        %><li class="jqfeDir jqfeItem" data-location="<% =sDir %>/<% =sName %>" data-type="folder">
                           <div class="jqfeObjName"><% =sName %></div>
                        </li><%
                     Next
                     For Each oFile in oFolder.Files
                        sName = oFile.Name
                        sExt = LCase(Mid(sName, InStrRev(sName, ".", -1, 1) + 1))
                        If InStr("asp, config, aspx, db, ini", sExt) = False Then
                           %><li class="jqfeFile jqfeExt<% =sExt %>" data-location="<% =sDir & "/" & sName %>" data-type="file">
                              <div class="jqfeObjName"><% =sName %></div>
                              <% If Request("fs") = "true" Then %>
                                 <div class="jqfeSize"><% =fByteSize(oFile.Size) %></div>
                              <% End If %>
                              <% If Request("fd") = "true" Then %>
                                 <div class="jqfeDate"><% =oFile.DateLastModified %></div>
                              <% End If %>
                           </li><%
                        End If
                     Next
                  %>
               </ul>
               <%
            End If
         Else
            sError = "Requested folder is not a subfolder of Root."
         End If
      End If
End Select
Set oUpload = Nothing
Set oFile = Nothing
Set oSubFolder = Nothing
Set oFolder = Nothing
Set oFS = Nothing
If sError <> "" Then Response.Write sError
%>