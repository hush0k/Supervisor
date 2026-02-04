import {useNavigate} from "react-router-dom";
import {useAuthStore} from "@/entities/user/model/store.js";
import {useState} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/shared/ui/card.jsx";
import {Label} from "@/shared/ui/label.jsx";
import { IoPersonAdd } from "react-icons/io5";
import {Input} from "@/shared/ui/input.jsx";
import {FaUser} from "react-icons/fa";
import {FaLock} from "react-icons/fa6";
import { PiBuildingOfficeFill } from "react-icons/pi";
import { BiSolidBuildings } from "react-icons/bi";
import { IoMdArrowForward } from "react-icons/io";
import {PasswordInput} from "@/shared/ui/password-input.jsx";
import {Button} from "@/shared/ui/button.jsx";
import {Textarea} from "@/shared/ui/textarea.jsx";

export function RegistrationForm() {
    const navigate = useNavigate();

    const { registerCompany, isLoading } = useAuthStore()

    const [formData, setFormData] = useState({
        company_name: '',
        company_description: '',
        date_established: '',
        login: '',
        password: '',
        first_name: '',
        last_name: '',
        date_of_birth: '',
        salary: '',
    })

    const [errors, setErrors] = useState({
        company_name: '',
        login: '',
        password: '',
        general: ''
    })

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({company_name: '', login: '', password: '', general: ''})

        const result = await registerCompany({...formData, salary: Number(formData.salary)})

        if (result.success) {
            navigate('/dashboard')
        } else {
            const fieldErrors = result.fieldErrors || {}
            const generalError = result.error || 'Ошибка регистрации'

            setErrors({
                company_name: fieldErrors.company_name || '',
                login: fieldErrors.login || (generalError.toLowerCase().includes('логин') ? generalError : ''),
                password: fieldErrors.password || '',
                general: generalError
            })
        }
    }

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value})
        setErrors({...errors, [e.target.name]: '', general: ''})
    }

    const formatNumber = (value) => {
        if (!value) return ''
        return value.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
    }


    const handleSalaryChange = (e) => {
        const raw = e.target.value.replace(/\D/g, '') // только цифры
        setFormData({
            ...formData,
            salary: raw,
        })
    }


    return (
        <Card className="space-y-2 max-w-xl_card">
            <CardHeader>
                <CardTitle className="text-xl font-bold">Создайте свой профиль</CardTitle>
                <CardDescription>Заполните все поля и начните анализ эффективности вашей компании</CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
                    <fieldset className="space-y-4">
                        <legend>
                            <Label htmlFor="" icon={ <IoPersonAdd /> } className="text-gray-500">
                                Личные данные
                            </Label>
                        </legend>

                        <div className="flex flex-row flex-wrap gap-x-10 gap-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="login">Логин</Label>
                                <Input
                                    id="login"
                                    name="login"
                                    value={formData.login}
                                    icon={ <FaUser /> }
                                    placeholder="username"
                                    className="w-80"
                                    onChange={ e => {
                                        setFormData({...formData, [e.target.name]: e.target.value })
                                        setErrors({...errors, [e.target.name]: '', general: ''})
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
                                    name="password"
                                    value={formData.password}
                                    icon={<FaLock />}
                                    placeholder="••••••••"
                                    className="w-80"
                                    onChange={handleChange}
                                    error={!!errors.password}
                                    required
                                />
                                {errors.password && (
                                    <p className="text-sm text-red-500">{errors.password}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="first_name">Имя</Label>
                                <Input
                                    id="first_name"
                                    name="first_name"
                                    value={formData.first_name}
                                    placeholder="Азамат"
                                    className="w-80"
                                    onChange={ e => {
                                        setFormData({...formData, [e.target.name]: e.target.value })
                                        setErrors({...errors, [e.target.name]: '', general: ''})
                                    }}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="last_name">Фамилия</Label>
                                <Input
                                    id="last_name"
                                    name="last_name"
                                    value={formData.last_name}
                                    placeholder="Рахымжан"
                                    className="w-80"
                                    onChange={ e => {
                                        setFormData({...formData, [e.target.name]: e.target.value })
                                        setErrors({...errors, [e.target.name]: '', general: ''})
                                    }}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="date_of_birth">Дата рождение</Label>
                                <Input
                                    id="date_of_birth"
                                    type="date"
                                    name="date_of_birth"
                                    value={formData.date_of_birth}
                                    placeholder="ДД.ММ.ГГГГ"
                                    className="w-80"
                                    onChange={ e => {
                                        setFormData({...formData, [e.target.name]: e.target.value })
                                        setErrors({...errors, [e.target.name]: '', general: ''})
                                    }}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="salary">Зарплата</Label>
                                <Input
                                    id="salary"
                                    name="salary"
                                    type="text"
                                    value={formatNumber(formData.salary)}
                                    placeholder="1 000 000"
                                    className="w-80"
                                    onChange={handleSalaryChange}
                                    required
                                />
                            </div>

                        </div>
                    </fieldset>

                    <hr/>


                    <fieldset className="space-y-4">
                        <legend>
                            <Label htmlFor="" icon={ <PiBuildingOfficeFill /> } className="text-gray-500">
                                Данные компании
                            </Label>
                        </legend>

                        <div className="flex flex-row flex-wrap gap-x-10 gap-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="company_name">Название компаний</Label>
                                <Input
                                    id="company_name"
                                    name="company_name"
                                    value={formData.company_name}
                                    icon={ <BiSolidBuildings /> }
                                    placeholder="TOO Qanysh"
                                    className="w-80"
                                    onChange={ e => {
                                        setFormData({...formData, [e.target.name]: e.target.value })
                                        setErrors({...errors, [e.target.name]: '', general: ''})
                                    }}
                                    error={!!errors.company_name}
                                    required
                                />
                                {errors.company_name && (
                                    <p className="text-sm text-red-500">{errors.company_name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="date_established">Дата создание компаний</Label>
                                <Input
                                    id="date_established"
                                    type="date"
                                    name="date_established"
                                    value={formData.date_established}
                                    placeholder="ДД.ММ.ГГГГ"
                                    className="w-80"
                                    onChange={ e => {
                                        setFormData({...formData, [e.target.name]: e.target.value })
                                        setErrors({...errors, [e.target.name]: '', general: ''})
                                    }}
                                    required
                                />
                            </div>

                            <div className="space-y-2 flex-grow w-full">
                                <Label htmlFor="company_description">Описание компаний</Label>
                                <Textarea
                                    id="company_description"
                                    name="company_description"
                                    value={formData.company_description}
                                    className="w-full"
                                    onChange={ e => {
                                        setFormData({...formData, [e.target.name]: e.target.value })
                                        setErrors({...errors, [e.target.name]: '', general: ''})
                                    }}
                                    placeholder="TOO Qanysh - компания ..."
                                    required
                                />
                            </div>
                        </div>
                    </fieldset>

                    {errors.general && !errors.login && !errors.password && !errors.company_name && (
                        <p className="text-sm text-red-500 text-center">{errors.general}</p>
                    )}

                    <div className="space-y-4 pb-4">
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Создание аккаунта...' : 'Создать аккаунт'}
                            <IoMdArrowForward />
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )

}