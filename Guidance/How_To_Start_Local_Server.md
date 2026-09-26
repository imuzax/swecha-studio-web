# Swecha Studio - Local Development Guide

Yeh document aapko Swecha Studio (Main Site) ko apne computer par locally start aur test karne ki puri details dega.

## 1. External Drive Connect Karna
Sabse pehle, kyunki aapka project ek external hard drive (`sda5`) mein save hai:
1. Apne computer mein **File Manager** (Files/Folders) open karein.
2. Apne external drive (jisme `Work/Freelancing/Clients/Swecha Studio` folder hai) par click karke usko open karein taaki wo system me **mount** ho jaye.
3. Jab tak drive mount nahi hoga, aap terminal mein project folder ko access nahi kar payenge.

## 2. Server Start Karna (2 Terminals Chahiye)

Swecha Studio ek modern web application hai jo **Laravel** (Backend) aur **React/Inertia.js + Vite** (Frontend) par bani hai. Isliye isko properly chalane ke liye dono servers ko on karna zaruri hai.

Apne code editor (VS Code) me ya system Terminal me project ke root folder (`/run/media/muzax/Work/Freelancing/Clients/Swecha Studio/Main Site`) ke andar jayein.

### Terminal 1: Backend (PHP) Server Start Karein
Neeche diye gaye command ko copy karke Terminal 1 me paste karein aur Enter dabayein. Ye command large file uploads (128MB) aur memory limit ko bhi set kar deta hai jisse images smoothly upload hongi:

```bash
cd public && php -d upload_max_filesize=128M -d post_max_size=128M -d memory_limit=256M -S 127.0.0.1:8000 ../vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php
```

### Terminal 2: Frontend (Vite) Server Start Karein
Ek naya terminal tab open karein (project ke root folder me) aur ye command chalayein:

```bash
npm run dev
```
*(Yeh command frontend ke changes ko instantly browser me update (Hot Reload) karega jab aap code change karenge)*

## 3. Site Access Karein
Dono servers on hone ke baad, apne browser (Chrome/Firefox/Brave) me ye URL type karein:
👉 **[http://127.0.0.1:8000](http://127.0.0.1:8000)**

## 4. Other Important Commands
Agar future me aap koi naya feature banate hain aur Database me changes karne hain ya cache clear karna hai, toh aap ye commands use kar sakte hain (Terminal me project folder ke andar):

- **Database update karne ke liye:** `php artisan migrate`
- **Cache clear karne ke liye:** `php artisan optimize:clear`
- **Storage link banane ke liye (Images show na ho tab):** `php artisan storage:link`

---
**Note:** Jab bhi computer restart ho, aapko Step 1 se process dobara repeat karni hogi (drive mount karna aur dono terminal commands run karna).
