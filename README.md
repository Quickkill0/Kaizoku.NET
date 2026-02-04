# Kaizoku


https://github.com/user-attachments/assets/ac0af0eb-5b4a-4377-b777-9fcafbc329ae

Video has brigthness issues, blame Microsoft. 



<table>
  <tr>
    <td width="150" border="0">
      <img width="150px" src="./KaizokuFrontend/public/kaizoku-logo.png" alt="Kaizoku"></img>
    </td>
    <td>
       <strong>Kaizoku</strong> is a modern fork of the original <strong>Kaizoku</strong> and <strong>Kaizoku Next Gen</strong> by OAE,  built to fill the void and bring a streamlined series manager back to life.<br/>
<strong>What does it do?</strong>  <br/>
When you subscribe to a series, it will automatically download it. Whenever the series is updated in any of your configured providers, new chapters will be downloaded automatically, in a “drop and forget” fashion.
    </td>
  </tr>
</table>

 

This is a **feature-complete** application (not a preview). While it may contain bugs, it *definitely doesn’t contain spiders*, yet.

---

## 🎯 What It Does

Kaizoku is a **series manager** that prioritizes simplicity, speed, and reliability, just like the original Kaizoku, but with powerful new features under the hood.

It uses the power of **Suwayomi Server** and **MIHON extensions** to connect with multiple sources.

---

## ✨ Key Features

- 🧙‍♂️ **Startup Wizard**  
  Automatically imports your existing library.

- 🔁 **Temporary vs Permanent Sources**  
  - Chapters are only downloaded from **temporary** sources when there is no permanent sources 
  - Auto-deleted if a **permanent** source later provides them.

- 🔎 **Multi-Search & Multi-Linking**  
  Search and link one series to **multiple sources/providers**.

- 📥 **Automatic Downloads, Retries, and Rescheduling**

- 🔄 **Auto-Updates**  
  Extensions are kept up to date.

- 🧹 **Filename Normalization**  
  Rebuild your library easily with consistent naming, that will help you reimport it back when needed.

- 🧾 **ComicInfo.xml Injection**  
  Chapters include rich metadata from the original source.

- 🖼️ **Extras**  
  - `cover.jpg` per series  
  - `kaizoku.json` for full metadata mapping  
  - And much more...

---

## 🛠️ Under the Hood

Kaizoku is composed of:

- **Frontend**: A beautiful UI forked from [Kaizoku Next by OAE](https://github.com/oae/kaizoku/tree/next) (Next.js).
- **Backend**: A custom .NET engine managing schedules, downloads, and metadata.
- **Bridge**: [Suwayomi Server](https://github.com/Suwayomi/Suwayomi-Server) (to access Mihon Android extensions).

> ❗ **Note:** Kaizoku does **not** use Suwayomi Server's built-in download or scheduling logic, only its extension bridge.

---

## ✅ Requirements for the TRAY Application (NOT DOCKER) [PLEASE READ] 

Java Runtime: JRE 21+ (recommended: Adoptium Temurin) — https://adoptium.net/

If you have multiple JREs installed, make sure the default is 21+ or Kaizoku may refuse to start.

## ⚙️ Configuration Notes [PLEASE READ]

- By default, **Suwayomi Server is embedded** and auto-launched by Kaizoku. 
- You **can expose Suwayomi’s port** (via Docker, or in your Browser when using the Desktop Tray App).
- You can also **use your own Suwayomi instance** by editing `appSettings.json` (after install). `appSettings.json` can be found:
  -  Docker:  in the config mapped folder.
  -  Windows: `C:\users\{your user}\local\KaizokuNET\`
  -  Mac/Linux: User Home folder `/.config/KaizokuNET`
  Change `UseCustomApi` to true, and put your own Suwayomi Url in `CustomEndpoint`
- If you have issues: `logs` folder, are in the same directory, you can check in there, or upload for feedback.
  
> ⚠️ **Warning:** Suwayomi assigns internal IDs for series/chapters which in every instance, most likely are different. 
> If you change servers, **you must reset Kaizoku** by deleting `kaizoku.db`, and start from scratch, as ID mappings will no longer match.

---

## 🤔 Why Suwayomi Server?

Only the **MIHON** extensions are actively maintained and they’re Android-based APKs.  
Suwayomi provides a working **Java bridge** for those. Other options (e.g., [IKVM](https://github.com/ikvmnet/ikvm)) were avoided due to complexity, Kotlin compatibility issues, and Java version mismatches.

---

## 🐳 Docker Support

- Available for both `amd64` and `arm64`.

### 📁 Volumes

| Container Path | Description                      |
|----------------|----------------------------------|
| `/config`      | Stores application configuration |
| `/series`      | Stores series                    |

---

### 🌐 Ports

| Port  | Service         | Required | Notes                        |
|-------|------------------|----------|------------------------------|
| 9833  | Kaizoku UI       | ✅       | Web interface                |
| 4567  | Suwayomi Server  | ❌       | Optional (if exposing port) |

---

### 👤 Permissions

| Variable | Value | Description                    |
|----------|-------|--------------------------------|
| `UID`    | 99    | Host user ID                   |
| `PGID`   | 100   | Host group ID                  |
| `UMASK`  | 022   | File permission mask (default) |

> Ensure the specified UID and PGID have write access to your mounted `/config` and `/series` directories.

---

### 🌐 Network Mode

It is recommended to use **host networking** for optimal performance when downloading a lot and querying multiple providers in parallel.

---

### 🚀 Example: One-Liner Run Command

```bash
docker run -d \
  --name kaizoku-net \
  --network host \
  -e UID=99 \
  -e PGID=100 \
  -e UMASK=022 \
  -v /path/to/your/config:/config \
  -v /path/to/your/series:/series \
  maxpiva/kaizoku-net:latest
```
Replace /path/to/your/config and /path/to/your/series with real paths on your host.

---

## 🐳 Unraid Template

```xml
<Container>
  <Name>Kaizoku</Name>
  <Repository>maxpiva/kaizoku-net:latest</Repository>
  <Registry>https://hub.docker.com/r/maxpiva/kaizoku-net</Registry>
  <Network>host</Network>
  <MyID>kaizoku-net</MyID>
  <Shell>sh</Shell>
  <Privileged>false</Privileged>
  <Support>https://github.com/maxpiva/kaizoku-net/issues</Support>
  <Project>https://github.com/maxpiva/kaizoku-net</Project>
  <Overview>Kaizoku – a feature-complete series manager powered by Suwayomi extensions. Forked from Kaizoku Next by OAE.</Overview>
  <Category>MediaManager:Comics</Category>

  <Config Name="Config Folder" Target="/config" Default="/mnt/user/appdata/kaizoku-net" Mode="rw" Description="Path to store configuration, database, and settings." Type="Path" />
  <Config Name="Series Folder" Target="/series" Default="/mnt/user/media/series" Mode="rw" Description="Path where series and chapters will be downloaded." Type="Path" />

  <Config Name="UID" Target="UID" Default="99" Mode="rw" Description="User ID to run the container as." Type="Variable" />
  <Config Name="PGID" Target="PGID" Default="100" Mode="rw" Description="Group ID to run the container as." Type="Variable" />
  <Config Name="UMASK" Target="UMASK" Default="022" Mode="rw" Description="UMASK for file permissions." Type="Variable" />

  <WebUI>http://[IP]:9833</WebUI>

  <TemplateURL>https://raw.githubusercontent.com/maxpiva/kaizoku-net/main/unraid/kaizoku-net.xml</TemplateURL>
  <Icon>https://raw.githubusercontent.com/maxpiva/Kaizoku.NET/refs/heads/main/KaizokuFrontend/public/kaizoku-logo.png</Icon>
</Container>
```


---

## 🖥️ Desktop App

- A **tray application** based on Avalonia is available in the [Releases](https://github.com/maxpiva/Kaizoku.NET/releases).
- Currently tested only on **Windows**. Testers for Linux and macOS are welcome, as I’m unable to verify it myself.

---

## 🧱 Build It Yourself

It should be straightforward to build.  
Documentation coming soon™ (once laziness subsides).

---

## ⚠️ Resource Usage

Be aware: **Kaizoku** and **Suwayomi Server** can be **memory-intensive**, especially when managing large libraries or doing parallel searches and downloads.

---

## 🤝 Contributing

### Frontend Devs ! You're Needed 🙏  
Help clean up the mess left behind by our overenthusiastic friend, GitHub Copilot.

### Backend Devs ! PRs Welcome  
This was a **rushed 1-month project**. There are known race conditions and an import system that’s... let’s say *aggressively functional*.  
PRs are welcome to improve stability and architecture.

---

## 🏴‍☠️ Brace Yourself

This app *just works™*  until it doesn't. But it's here.
Start managing your series with the style it deserves.
