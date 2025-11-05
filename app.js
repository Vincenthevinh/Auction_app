import express from 'express';
import session from 'express-session';
import { engine } from 'express-handlebars';

// Khởi tạo app trước
const app = express();

// Cấu hình View Engine
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

// Cấu hình session
app.use(session({
  secret: 'supersecretkey',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false, // secure: true nếu chạy HTTPS
    maxAge: 1000 * 60 * 60, // 1 giờ
  }
}));

// Middleware xử lý body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Route test session ✅
app.get('/', (req, res) => {
  req.session.visitCount = (req.session.visitCount || 0) + 1;
  res.send(`You visited this page ${req.session.visitCount} times`);
});

// Lắng nghe cổng
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
