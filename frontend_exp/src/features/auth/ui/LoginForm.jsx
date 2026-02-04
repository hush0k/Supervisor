import {useNavigate} from "react-router-dom";
import {useAuthStore} from "@/entities/user/model/store.js";
import {useState} from "react";
import {Card, CardHeader, CardContent, CardTitle, CardDescription} from "@/shared/ui/card.jsx";
import {Logo} from "@/shared/ui/logo.jsx";
import { FaUser } from "react-icons/fa";
import { FaLock } from "react-icons/fa6";
import {Label} from "@/shared/ui/label.jsx";
import {Input} from "@/shared/ui/input.jsx";
import {Link} from "@/shared/ui/link.jsx";
import {Button} from "@/shared/ui/button.jsx";
import {PasswordInput} from "@/shared/ui/password-input.jsx";
import logo from "@/assets/logos/supervisor.svg"

export function LoginForm() {
    const navigate = useNavigate();
    const { login, isLoading } = useAuthStore()
    const [formData, setFormData] = useState({login: '', password: ''})
    const [errors, setErrors] = useState({login: '', password: '', general: ''})

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErrors({login: '', password: '', general: ''})

        const result = await login(formData.login, formData.password)

        if (result.success) {
            navigate('/dashboard')
        } else {
            setErrors({
                login: 'Неверный логин или пароль!',
                password: 'Неверный логин или пароль!',
                general: result.error
            })
        }
    }

    return (
        <div className="flex-col space-y-4">
            <Card className="flex flex-col items-center justify-center bg-secondary_card p-4 max-w-card">
                <CardHeader className="mb-5">
                    <Logo size={30} src={logo} />
                    <CardTitle className="mb-4">Добро Пожаловать</CardTitle>
                    <CardDescription className=''>Пожалуйста, введите ваши данные для получение доступа к корпоративной статистике</CardDescription>
                </CardHeader>
                <CardContent className="w-full">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="login">Логин</Label>
                            <Input
                                id="login"
                                value={formData.login}
                                icon={<FaUser />}
                                placeholder="username"
                                onChange={e => {
                                    setFormData({...formData, login: e.target.value})
                                    setErrors({...errors, login: '', general: ''})
                                }}
                                error={!!errors.login}
                                required
                            />
                            {errors.login && (
                                <p className="text-sm text-red-500">{errors.login}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Пароль</Label>
                            <PasswordInput
                                id="password"
                                icon={<FaLock />}
                                value={formData.password}
                                placeholder="••••••••"
                                onChange={e => {
                                    setFormData({...formData, password: e.target.value})
                                    setErrors({...errors, password: '', general: ''})
                                }}
                                error={!!errors.password}
                                required
                            />
                            {errors.password && (
                                <p className="text-sm text-red-500">{errors.password}</p>
                            )}
                        </div>

                        <div className="w-full flex justify-end">
                            <Link to="/">Забыли пароль?</Link>
                        </div>

                        <div className="space-y-4 pb-4">
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Вход...' : 'Войти'}
                            </Button>
                        </div>

                        <hr />

                        <div className="space-y-2 text-center">
                            <span className="text-sm">Нет аккаунта? <Link to="/register">Создать аккаунт</Link></span>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}